import { v4 as uuidv4 } from 'uuid';
import raffleDao from './raffle.data.js'

const RAFFLE_TICKET_PRICE = 10.0
const RAFFLE_NAME = "Win an iPhone"

export default (db) => {
    const { findRaffleTicketsForTransaction, saveRaffleTransaction, updateRaffleTransaction } = raffleDao(db);

    const issueRaffleTickets = async (transaction) => {
        // For the sake of this PoC:
        // - Imaginine raffle tickets are awarded from monday -> saturday during the first and third week of each month.
        // - A raffle ticket is issued for every $10 spent on a transaction
        // - The draw happens on sunday of the first and third week of each month. No raffle tickets are issued on draw day.
        try {
            // Calculate the number of raffle tickets to award.
            const ticketsToAward = Math.floor(transaction.totalAmount / RAFFLE_TICKET_PRICE);

            // Check if the transaction has already been awarded raffle tickets
            const raffleTransaction = await findRaffleTicketsForTransaction(transaction.id)

            console.log(`Transaction: ${transaction.id}. Amount: ${transaction.totalAmount}. Tickets To Award: ${ticketsToAward}. Tickets Awarded: ${raffleTransaction === null}`)
            // If the transaction has not been awarded raffle tickets, award them.
            if (!raffleTransaction) {
                if (ticketsToAward == 0 || !isRaffleTicketDay()) {
                    console.log(`0 raffles awarded to Transaction '${transaction.id}' with totalAmount '${transaction.totalAmount}'.`)
                    return null;
                }

                console.log(`${ticketsToAward} raffles awarded to Transaction '${transaction.id}' with totalAmount '${transaction.totalAmount}'.`)
                return await saveRaffleTransaction({
                    id: uuidv4(),
                    raffleName: RAFFLE_NAME,
                    transactionId: transaction.id,
                    transactionAmount: transaction.totalAmount,
                    tickets: ticketsToAward,
                    customerId: transaction.customerId,
                })

            }

            // If the amount of the transaction has been updated, also update the amount of raffle tickets.
            if (raffleTransaction.transactionAmount !== transaction.totalAmount) {
                return await updateRaffleTransaction({
                    ...raffleTransaction,
                    tickets: ticketsToAward,
                    transactionAmount: transaction.totalAmount
                })
            }

        } catch (e) {
            console.error(e);
        }
    }

    return {
        issueRaffleTickets,
    }
}

const isRaffleTicketDay = () => {
    const weekNumber = getWeekNumber();
    const isRaffleWeek = weekNumber % 2 != 0; // If the week is odd, it's probably the 1st/3rd week of a month
    const isDrawDay = new Date().getDay() == 0; // Draw day is sunday

    return true//isRaffleWeek && !isDrawDay
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