import { type AuthenticationService } from './types.js'
import { default as config } from '../config/index.js'
import { createUser as createLocalUser, getUserByUsername as getLocalUserByUsername } from './local.js'
import { createUser as createKeycloakUser, getUserByUsername as getKeycloakUserByUsername } from './keycloak.js'

export * from './types.js'

const { auth } = config

const authenticationService: AuthenticationService = {
    createUser: auth.useLocal ? createLocalUser : createKeycloakUser,
    getUserByUsername: auth.useLocal ? getLocalUserByUsername : getKeycloakUserByUsername,
}

export default authenticationService