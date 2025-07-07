import config from '../config/index.js';
import cache from '../cache/index.js';
import { RoleRepresentation } from './internal-types.js';

const { auth } = config;
const { get: cacheGet, set: cacheSet } = cache;

const CACHE_KEY_TOKEN = 'keycloak:admin-token';
const CACHE_KEY_REALM_ROLES = 'keycloak:realm-roles';

const getToken = async (): Promise<string> => {
    const cached = await cacheGet(CACHE_KEY_TOKEN);
    if (cached) return cached;

    const form = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: auth.connection.clientId,
        client_secret: auth.connection.clientSecret,
    });

    const response = await fetch(`${auth.connection.authUrl}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
    });

    const json = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get token: ${JSON.stringify(json)}`);
    }

    const { access_token: token, expires_in } = json;
    await cacheSet(CACHE_KEY_TOKEN, token, { timeToLiveSeconds: expires_in - 30 });

    return token;
};

const getRealmRoles = async (): Promise<RoleRepresentation[]> => {
    const cached = await cacheGet(CACHE_KEY_REALM_ROLES);
    if (cached) return JSON.parse(cached);

    const { res, json } = await kcFetch(
        `/admin/realms/${auth.connection.tenant}/roles`,
        { method: 'GET' }
    );

    if (!res.ok) {
        throw new Error(`getRealmRoles: ${res.status} - ${JSON.stringify(json)}`);
    }

    await cacheSet(CACHE_KEY_REALM_ROLES, JSON.stringify(json), { timeToLiveSeconds: 600 });
    return json as RoleRepresentation[];
};

const safeJson = async (response: Response) => {
    const len = response.headers.get('Content-Length');
    if (!len || parseInt(len, 10) === 0) return null;
    return response.json();
};

const kcFetch = async (
    path: string,
    options: Omit<RequestInit, 'headers'> & { token?: string } = {}
) => {
    const token = options.token || await getToken();
    console.log('Using token', token)

    const res = await fetch(`${auth.connection.authUrl}${path}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            //...(options.headers || {}),
        },
    });

    const json = await safeJson(res);
    return { res, json };
};

export { kcFetch, getRealmRoles };
