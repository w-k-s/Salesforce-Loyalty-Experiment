import { type Transaction } from '../loyalty/types.js';
import { type Raffle } from './types.js';
import {
    findRaffleByTransactionId,
    updateRaffleTransaction,
    saveRaffleTransaction
} from './raffle.data.js';

// Constants
const RAFFLE_TICKET_PRICE = 10.0;
const RAFFLE_NAME = 'Win an iPhone';

/**
 * Issues raffle tickets for a transaction, if eligible.
 * - A raffle ticket is awarded for every $10 spent.
 * - Tickets are issued only from Monday to Saturday during the 1st and 3rd weeks of each month.
 * - No tickets are issued on draw days (Sundays).
 */
export const issueRaffleTickets = async (messageContent: Transaction, msg) => {
    console.log(`issueRaffleTickets: Event Received`, JSON.stringify(event))

    try {
        const { id: transactionId, totalAmount, customerId } = messageContent;

        // Determine how many tickets to award
        const ticketsToAward = BigInt(totalAmount) / BigInt(RAFFLE_TICKET_PRICE);

        // Check for existing raffle entry
        const result = await findRaffleByTransactionId(transactionId);

        const update: Raffle = {
            raffleName: RAFFLE_NAME,
            transactionId,
            totalAmount: Number(totalAmount),
            raffleTickets: ticketsToAward,
            customerId,
            createdDate: result === "NOT_FOUND" ? new Date() : result.createdDate,
            modifiedDate: new Date()
        }

        if (result === 'NOT_FOUND' && isRaffleTicketDay() && ticketsToAward > 0) {
            saveRaffleTransaction(update)
            console.log(
                `${ticketsToAward} raffle ticket(s) awarded for Transaction '${transactionId}'`
            );
        } else if (result != 'NOT_FOUND' && result.raffleTickets !== ticketsToAward) {
            console.log(
                `Updating raffle tickets for Transaction '${transactionId}' to ${ticketsToAward}`
            );
            updateRaffleTransaction(update)
        }

    } catch (e) {
        console.error('Failed to issue raffle tickets:', e);
    }
};

/**
 * Determines if today is a valid day for issuing raffle tickets.
 * - Tickets are only issued on Monday–Saturday
 * - Tickets are only issued in odd-numbered weeks (assumed to be 1st/3rd weeks)
 */
const isRaffleTicketDay = () => {
    const today = new Date();
    const isSunday = today.getDay() === 0; // 0 = Sunday
    const isOddWeek = getWeekNumber(today) % 2 !== 0;

    return isOddWeek && !isSunday;
};

/**
 * Returns the ISO week number for a given date.
 * ISO weeks start on Monday and the first week of the year is the one with the first Thursday.
 */
const getWeekNumber = (date = new Date()): number => {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};
