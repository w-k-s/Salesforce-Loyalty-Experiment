export default ({ salesforceConnection, authenticationService }) => {

    const pretendCache = {}

    const registerMember = async ({ request }) => {
        const cacheKey = `registration:${request.email}`
        try {
            // Create Contact in Salesforce
            let id = pretendCache[cacheKey];
            if (!id) {
                const { id: salesforceId } = await salesforceConnection.sobject("Contact").create({
                    FirstName: request.firstName,
                    MiddleName: request.middleName,
                    LastName: request.lastName,
                    Birthdate: request.birthDate,
                    Email: request.email,
                    //GenderIdentity: request.gender,
                    MobilePhone: request.mobileNumber
                });
                id = salesforceId
                pretendCache[cacheKey] = salesforceId
            }

            console.log(`Member '${request.email}' registered with id '${id}'`)
            // Register User on Keycloak (sends OTP over SMS)
            await authenticationService.createUser({
                id: id,
                username: request.email,
                password: request.password,
                firstName: request.firstName,
                middleName: request.middleName,
                lastName: request.lastName,
                email: request.email,
                mobileNumber: request.mobileNumber,
            })

            console.log(`Member '${id}' created on keycloaks`)
            return id;
        } catch (e) {
            console.error(e);
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