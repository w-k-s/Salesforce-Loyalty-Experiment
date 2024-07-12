export default ({ salesforceConnection, authService }) => {

    const registerMember = async ({ request }) => {
        try {
            // Create Contact in Salesforce
            const { id } = await salesforceConnection.sobject("Contact").create({
                FirstName: request.firstName,
                MiddleName: request.middleName,
                LastName: request.lastName,
                Birthdate: request.birthDate,
                Email: request.email,
                GenderIdentity: request.gender,
                MobilePhone: request.mobileNumber
            });

            console.log(`Member '${request.email}' registered with id '${id}'`)
            // Register User on Keycloak (sends OTP over SMS)
            await authService.createUser({
                ...request,
                id: id,
            })

            console.log(`Member '${id}' created on keycloaks`)
            return id;
        } catch (e) {
            console.error(e);
        }
    }


    return {
        registerMember
    }
}