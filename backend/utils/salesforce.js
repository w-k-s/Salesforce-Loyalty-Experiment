import jsforce from 'jsforce';
import grpc from '@grpc/grpc-js';
import avro from 'avro-js';
import protoLoader from '@grpc/proto-loader';
import EventEmitter from 'events';

export async function salesforceLogin(
    username,
    password,
    securityToken
) {
    const passwordWithSecurityToken = `${password}${securityToken}`
    const salesforceConnection = new jsforce.Connection({
        refreshFn: async (conn, callback) => {
            try {
                // re-auth to get a new access token
                await conn.login(username, passwordWithSecurityToken);
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
    await salesforceConnection.login(username, passwordWithSecurityToken);
    return salesforceConnection
}