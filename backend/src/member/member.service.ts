import cache from '../cache/index.js'
import loyalty, { type ContactId } from '../loyalty/index.js'
import { type CreateMemberRequest } from './types.js'
import identityProvider from '../auth/index.js'

const { get: cacheGet, set: cacheSet } = cache

export const registerMember = async (request: CreateMemberRequest): Promise<ContactId> => {
    const loyaltyCompletionKey = `registration:loyalty:${request.email}`
    const identityProviderCompletionKey = `registration:identity:${request.email}`
    try {
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
            await cacheSet(identityProviderCompletionKey, userId)
        }

        return id;
    } catch (e) {
        if (e.errorCode === "DUPLICATES_DETECTED") {
            throw new Error("Account already exists")
        }
        throw e
    }
}
