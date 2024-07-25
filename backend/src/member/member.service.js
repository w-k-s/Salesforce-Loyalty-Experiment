
const REALM_ROLES_KEY = "registration:realm-roles"
export default ({ salesforceConnection, authenticationService, cacheSet, cacheGet }) => {

    const registerMember = async ({ request }) => {
        const salesforceCompletionKey = `registration:salesforce:${request.email}`
        const keycloakCompletionKey = `registration:keycloak:${request.email}`
        try {
            // Create Contact in Salesforce
            let id = await cacheGet(salesforceCompletionKey);
            if (!id) {

                id = await createSalesforceContact({ salesforceConnection, request })
                await cacheSet(salesforceCompletionKey, id)
            }

            console.log(`Member '${request.email}' registered with Salesforce id '${id}'`)

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

    const findMemberById = async (id) => {
        const contacts = await salesforceConnection.sobject("Contact")
            .select("Id, FirstName, LastName, Birthdate, Email, MobilePhone")
            .where({ Id: id })
            .limit(1)
            .execute();

        if (contacts.length === 0) {
            throw new Error('Contact not found');
        }

        const [contact] = contacts;
        const {
            FirstName: firstName,
            LastName: lastName,
            Birthdate: birthDate,
            Email: email,
            MobilePhone: mobileNumber
        } = contact;

        return {
            id,
            firstName,
            lastName,
            email,
            mobileNumber,
            birthDate: new Date(birthDate)
        };
    };

    return {
        registerMember,
        findMemberById
    }
}

const createSalesforceContact = async ({ salesforceConnection, request }) => {
    const { id: salesforceId } = await salesforceConnection.sobject("Contact").create({
        FirstName: request.firstName,
        MiddleName: request.middleName,
        LastName: request.lastName,
        Birthdate: request.birthDate,
        Email: request.email,
        //GenderIdentity: request.gender,
        MobilePhone: request.mobileNumber
    });
    return salesforceId
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