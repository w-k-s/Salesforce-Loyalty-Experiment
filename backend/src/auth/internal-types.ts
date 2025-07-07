export interface UserRepresentation {
    id: string
    username: string
    firstName: string
    lastName: string
    email: string
    emailVerified: boolean
    attributes?: Record<string, any[]>
    realmRoles?: string[]
    clientRoles?: string[]
}

export interface RoleRepresentation {
    id: string
    name: string
    description?: string
    scopeParamRequired?: boolean
    composite?: boolean
    clientRole?: boolean
    containerId?: string
    attributes?: Record<string, any[]>
}