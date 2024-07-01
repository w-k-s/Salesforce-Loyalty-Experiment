import { v4 as uuidv4 } from 'uuid';
        
export async function issueRaffleTickets({transaction}) {
    // For the sake of this PoC:
    // - Imaginine raffle tickets are awarded from monday -> saturday in the first and third week of each month.
    // - The draw happens on sunday of the first and third week of each month.
    // - A raffle ticket costs $10
    try {    
        if(transaction.Total_Amount__c || 0.0 < 10.0){
            console.log(`0 raffles awarded to Transaction '${transaction.Id}'. Reason: Not enough spent`)
            return [];
        }

        const weekNumber = getWeekNumber();
        const isRaffleWeek = weekNumber % 2 != 0; // If the week is odd, it's probably the 1st/3rd week of a month
        const isDrawDay = new Date().getDay() !== 0; // Draw day is sunday
        
        if(!isRaffleWeek){
            console.log(`0 raffles awarded to Transaction '${transaction.Id}'. Reason: Not draw week`)
            return [];
        }

        if(isDrawDay){
            console.log(`0 raffles awarded to Transaction '${transaction.Id}'. Reason: Draw Day`)
            return []
        }

        const ticketsToAward = Math.floor(totalAmount / 10);
        return Array.from({ length: ticketsToAward }, () => ({
            raffleTicket: uuidv4(),
            transactionId: transaction.Id
        }));
        
        // TODO: await Save to db.

    } catch (e) {
        console.error(e);
    }
}

const getWeekNumber = (date = new Date()) => {
    // Create a copy of the date object
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
    // Set to the nearest Thursday: current date + 4 - current day number (adjust for the week's start on Monday)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  
    // Get the first day of the year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
    // Calculate the full weeks to the nearest Thursday
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
    return weekNo;
  };