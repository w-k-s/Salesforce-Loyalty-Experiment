import jsforce from 'jsforce';

export async function salesforceLogin(
    connection,
    username,
    password,
    securityToken
) {
    const userInfo = await connection.login(username, `${password}${securityToken}`);
    console.log("userInfo", userInfo);
    return userInfo
}

