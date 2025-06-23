export const createContact = async({salesforceConnection, request}) => {
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

export const findMemberById = async ({salesforceConnection,id}) => {
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


