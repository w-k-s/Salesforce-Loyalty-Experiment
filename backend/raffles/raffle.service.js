import { v4 as uuidv4 } from 'uuid';

export async function issueRaffleTickets(transaction) {
    // For the sake of this PoC:
    // - Imaginine raffle tickets are awarded from monday -> saturday during the first and third week of each month.
    // - A raffle ticket is issued for every $10 spent on a transaction
    // - The draw happens on sunday of the first and third week of each month. No raffle tickets are issued on draw day.

    try {

        if ((transaction.totalAmount || 0.0) < 10.0) {
            console.log(`0 raffles awarded to Transaction '${transaction.id}' with totalAmount '${transaction.totalAmount}'. Reason: Not enough spent`)
            return [];
        }

        // TODO: Check if raffles already exists in the db for this transaction.

        const weekNumber = getWeekNumber();
        const isRaffleWeek = weekNumber % 2 != 0; // If the week is odd, it's probably the 1st/3rd week of a month
        const isDrawDay = new Date().getDay() == 0; // Draw day is sunday

        if (!isRaffleWeek) {
            console.log(`0 raffles awarded to Transaction '${transaction.id}'. Reason: Not raffle week`)
            return [];
        }

        if (isDrawDay) {
            console.log(`0 raffles awarded to Transaction '${transaction.id}'. Reason: Draw Day`)
            return []
        }

        const ticketsToAward = Math.floor(transaction.totalAmount / 10);
        console.log(`Raffle Tickets Awarded: ${ticketsToAward}`)
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