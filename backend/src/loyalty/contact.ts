import { NotFoundError } from '../errors/index.js';
import { type CreateContactRequest, type Contact, type ContactId } from './types.js';
import { default as salesforceConnection } from './connection.js'

export const createContact = async (request: CreateContactRequest): Promise<ContactId> => {
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

export const findMemberById = async (id: ContactId): Promise<Contact> => {
    const contacts = await salesforceConnection.sobject("Contact")
        .select("Id, FirstName, LastName, Birthdate, Email, MobilePhone")
        .where({ Id: id })
        .limit(1)
        .execute();

    if (contacts.length === 0) {
        throw new NotFoundError('Contact not found');
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
    } satisfies Contact;
};


