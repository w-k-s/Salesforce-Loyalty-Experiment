
interface AuthPayload {
    customerId: string
    realm_access?: { roles: string[] }
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
            }
        }
    }
}