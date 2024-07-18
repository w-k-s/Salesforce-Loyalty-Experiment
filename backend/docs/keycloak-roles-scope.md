## Client Credentials with Keycloak

## Roles

- A `role` represents a set of priveleges e.g. `admin`, `user`, `third-party`.
- Roles can be created in a realm in the `Realm Roles` tab. These are roles that are applicable to the entire realm.

![Create Role](./media/create-role.gif)

## Scope

- A `scope` is something that a role can do e.g. `view-account`.
- A scope can also be created in the `Realm Roles` tab. These are scopes that are applicable to the entire realm.


![Create Scope](./media/create-scope.gif)

## Assigning scopes to roles

From what I understand
- A `role` (e.g. `admin`) can be made composite by containing other `roles` 
- So to assign scopes to a role, you create a role (e.g. `admin`) and then you add associated roles (e.g. `view-account`)

![Assign scope to role](./media/assign-scope-to-role.gif)

## Assigning a role to a client

- A role is assigned to a client if:
    1. It is added to the dedicated scope
        1. Select the Realm
        1. Select the Client
        1. Select the ``Client Scopes` Tab
        1. In the `Setup` tab, click on the `${client-name}-dedicated`.
        1. In the next screen, select `Scope` and assign the role by clicking on `Assign Role`
    2. If the role is assigned to the service account

![Assign role to client](./media/assign-role-to-client.gif)

![Get Token](./media/get-the-token.gif)