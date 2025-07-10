import cache from '../cache/index.js'
import loyalty, { type ContactId } from '../loyalty/index.js'
import { type CreateMemberRequest } from './types.js'
import identityProvider from '../auth/index.js'

const { get: cacheGet, set: cacheSet, invalidate } = cache

export const registerMember = async (request: CreateMemberRequest): Promise<ContactId> => {
    const loyaltyCompletionKey = `registration:loyalty:${request.email}`
    const identityProviderCompletionKey = `registration:identity:${request.email}`

    // Create Contact in Loyalty
    let id = await cacheGet(loyaltyCompletionKey);
    if (!id) {
        id = await loyalty.createContact({
            firstName: request.firstName,
            middleName: request.middleName,
            lastName: request.lastName,
            email: request.email,
            mobileNumber: request.mobileNumber,
            birthDate: new Date(request.birthDate)
        })

        if (id === 'CONTACT_EXSITS') {
            throw new Error("Account already exists")
        }

        await cacheSet(loyaltyCompletionKey, id)
    }

    console.log(`Member '${request.email}' registered with id '${id}'`)

    // Create User in IDP 
    let userId = await cacheGet(identityProviderCompletionKey)
    if (!userId) {
        userId = await identityProvider.createUser({
            contactId: id,
            firstName: request.firstName,
            lastName: request.lastName,
            email: request.email,
            emailVerified: true,
            mobileNumber: request.mobileNumber,
            password: request.password
        })
        if (userId === 'USER_EXISTS') {
            throw new Error("Account already exists")
        }
        await cacheSet(identityProviderCompletionKey, userId)
    }

    await invalidate(loyaltyCompletionKey)
    await invalidate(identityProviderCompletionKey)

    return id;

}
