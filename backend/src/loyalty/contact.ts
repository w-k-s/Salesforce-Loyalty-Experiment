import { NotFoundError } from '../errors/index.js';
import { type CreateContactRequest, type Contact, type ContactId } from './types.js';
import { default as salesforceConnection } from './connection.js'
import { SaveResult } from 'jsforce/index.js';

export const createContact = async (request: CreateContactRequest): Promise<ContactId | 'CONTACT_EXISTS'> => {
    const result: SaveResult = await salesforceConnection.sobject("Contact").create({
        FirstName: request.firstName,
        MiddleName: request.middleName,
        LastName: request.lastName,
        Birthdate: request.birthDate,
        Email: request.email,
        //GenderIdentity: request.gender,
        MobilePhone: request.mobileNumber
    });

    if (result.success) {
        return result.id
    } else {
        console.log(result.errors)
        if (result.errors.some((e) => e.errorCode == 'DUPLICATES_DETECTED')) {
            return 'CONTACT_EXISTS'
        }
        throw new Error('Failed to create contact')
    }
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


