import jsforce from 'jsforce'
import { default as config } from '../config/index.js';
const { salesforce } = config;

const salesforceConnection = new jsforce.Connection({
    loginUrl: salesforce.connection.loginUrl,
    refreshFn: async (conn, callback) => {
        try {
            // re-auth to get a new access token
            await conn.login(salesforce.connection.username, salesforce.connection.getPasswordWithToken());
            if (!conn.accessToken) {
                throw new Error('Access token not found after login');
            }

            console.log("Token refreshed")

            // 1st arg can be an `Error` or null if successful
            // 2nd arg should be the valid access token
            callback(null, conn.accessToken);
        } catch (err) {
            if (err instanceof Error) {
                callback(err);
            } else {
                throw err;
            }
        }
    }
});

await salesforceConnection.login(salesforce.connection.username, salesforce.connection.getPasswordWithToken())

export default salesforceConnection;