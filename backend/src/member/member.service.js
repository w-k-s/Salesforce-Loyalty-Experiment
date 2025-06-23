
const REALM_ROLES_KEY = "registration:realm-roles"
export default ({ loyalty, authenticationService, cacheSet, cacheGet }) => {

    const registerMember = async ({ request }) => {
        const loyaltyCompletionKey = `registration:loyalty:${request.email}`
        const keycloakCompletionKey = `registration:keycloak:${request.email}`
        try {
            // Create Contact in Loyalty
            let id = await cacheGet(loyaltyCompletionKey);
            if (!id) {

                id = await loyalty.createContact({ request })
                await cacheSet(loyaltyCompletionKey, id)
            }

            console.log(`Member '${request.email}' registered with id '${id}'`)

            // Create User in Keycloak 
            let keycloakId = await cacheGet(keycloakCompletionKey)
            if (!keycloakId) {
                keycloakId = await createUserOnKeycloak({ authenticationService, request, salesforceId: id })
                await cacheSet(keycloakCompletionKey, keycloakId)
            }

            // fetch realm roles for the client
            let realmRoles = await authenticationService.getRealmRoles()

            // save realm role for user
            const [memberRole] = realmRoles.filter((role) => role.name === "loyalty-member")
            console.log({ memberRole })

            await updateUserRoles({ authenticationService, keycloakId, memberRole })

            return id;
        } catch (e) {
            if (e.errorCode === "DUPLICATES_DETECTED") {
                throw new Error("Account already exists")
            }
            throw e
        }
    }

    return {
        registerMember,
    }
}

const createUserOnKeycloak = async ({ authenticationService, request, salesforceId }) => {
    await authenticationService.createUser({
        id: salesforceId,
        username: request.email,
        password: request.password,
        firstName: request.firstName,
        middleName: request.middleName,
        lastName: request.lastName,
        email: request.email,
        mobileNumber: request.mobileNumber,
    })

    console.log(`Member '${salesforceId}' created on keycloaks`)

    const result = await authenticationService.getUserByUsername(request.email)
    console.log(`Member '${salesforceId}' created on keycloak with id ${result.id}`)
    return result.id
}

const updateUserRoles = async ({ authenticationService, keycloakId, memberRole }) => {
    await authenticationService.updateUserRoles({
        userId: keycloakId,
        roles: [memberRole]
    })
    console.log(`Member '${keycloakId}' assigned role ${memberRole.name}`)
}