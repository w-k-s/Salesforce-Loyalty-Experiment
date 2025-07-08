# Keycloak Setup
---

## Setup

### Clients

- A client is a service or application that requests authentication from Keycloak
- In this project, we have two clients:

    - `loyalty-client`: A client that requests Keycloak to authenticate requests from a user. Typically a front-end e.g. A Frequent Flyer Programme mobile app.
    - `partner-1`: A client that requests Keycloak to authenticate requests from the partner backend. The partner could be a car rental company that is integrating with the Frequent Flyer loyalty programme.

To create a client:

1. Select the realm in which the client will operate, e.g. `loyalty`.
1. Click on the **Clients** tab.
1. Click on **Create Client**.
1. In **General Settings**, provide a client ID (e.g. `loyalty-client`) and a name (e.g. `Loyalty Client`).
1. In **Capability Settings**:
   - `loyalty-client` will authenticate users using the **Standard flow (Authorization Code with PKCE)**. **Client Authentication** is **not enabled**. 
   - `partner-1` will authenticate using the `client_credentials` grant type (`client_credentials` is intended for machine-to-machine authentication). **Client Authentication** and **Authorization** are **enabled**.
1. In **Login Settings**, If the **Standard flow** is enabled (as with `loyalty-client`), you must provide a valid **Redirect URI**:
    - **For `loyalty-client`**:  Use a development URI like `http://localhost:3000/*` (not recommended for production).
    - **For `partner-1`**:  No redirect URI is needed, since it does not use the Standard flow.

**Loyalty Client Configuration**:

![Loyalty Client](./media/create-client.gif)

**Partner Client Configuration**:

![Partner Configuration](./media/parnter-config.png)

### Realm Roles

- A `Realm Role` defines role, such as an `admin` user, or an app `user`, or a `third-party` client.
- Roles can be created within a realm using the **Realm Roles** tab. They can be assigned to both clients and users in the realm.
- In this project, we have two roles:

    - `loyalty-member`: This is the role that is assigned to app users.
    - `loyalty-partner`: This is the role that is assigned to the API clients used by the partner backend.

To create a Realm Role:
1. Select the realm in which the role is available, e.g. `loyalty`.
1. Click on the **Realm roles** tab.
1. Click on **Create role**.
1. Enter a name e.g. `loyalty-member` or `loyalty-partner`.

![Create Role](./media/create-role.gif)

### Scope

- A `scope` is something that a role can do e.g. a `loyalty-member` can `view-account`. A `loyalty-partner` can `create-transaction`. `loyalty-member` and `loyalty-partner` are roles. `view-account` and `create-transaction` are scopes.
- Confusingly, roles and scopes are the same thing on Keycloak; they are both `Realm Roles`. 

To create a Scope:

1. Select the realm in which the role is available, e.g. `loyalty`.
1. Click on the **Realm roles** tab.
1. Click on **Create role**.
1. Enter a name e.g. `view-profile`, `create-transaction`.

![Create Scope](./media/create-scope.gif)

### Assigning scopes to roles

- We need to link a `scope` to a `role` on Keycloak to say that a role `loyalty-member` can `view-profile`.
- To add a `scope` to a `role`, the role must be a **composite role**. This is done by associating scope roles (e.g. `create-transaction`) with the realm role (e.g. `loyalty-partner`).

To assign scope(s) to a role:
1. Select the realm in which the role is available, e.g. `loyalty`.
1. Click on the **Realm roles** tab.
1. Select the role in which you want to add scopes e.g. let's add `create-transaction` to `loyalty-partner`. In this case, we select the `loyalty-partner` role.
1. On the role page, select **Actions** and select **Add Associated Roles** from the drop-down.
1. In the assign roles modal dialog, select the filter **Filter by realm roles**. Select the scopes that the role can perform e.g. `create-transaction`. Then **Save**.

![Assign scope to role](./media/assign-scope-to-role.gif)


### Assigning a role to a client

Up to this point, we have defined that `loyalty-member` can `view-profile` and `loyalty-partner` can `create-transaction`. Now we need to configure Keycloak so that a member that signs-up is given the `loyalty-member` role so that they can see their profile and so that `loyalty-partner` API clients are assigned the `loyalty-partner` role so that they can Create Transactions.

For members, the sign-up API assigns the `loyalty-member` role to the user.

For Partner API Clients, Once a client is created (e.g. `partner-1`), the client must be assigned the `loyalty-partner` role manually from the Keycloak admin portal. The steps for the latter are explained below:

- A role is assigned to a client if:
    1. It is added to the dedicated scope
        1. Select the Realm e.g. `loyalty`
        1. Select the Client e.g. `parnter-1`
        1. Select the `Client Scopes` Tab
        1. In the `Setup` tab, click on the `${client-name}-dedicated` e.g. `partner-1-dedicated`
        1. In the next screen, select `Scope`. 
        1. Click on `Assign role`, filter by realm roles (instead of filtering by clients) and then select the role to assign e.g. `loyalty-program-partner`
    2. If the role is assigned to the service account (recommended)
        1. Select the Realm e.g. `loyalty`
        1. Select the Client e.g. `parnter-1`
        1. Select the `Service Account Roles` Tab
        1. Click on `Assign role`, filter by realm roles (instead of filtering by clients) and then select the role to assign e.g. `loyalty-program-partner`

![Assign role to client](./media/assign-role-to-client.gif)

![Get Token](./media/get-the-token.gif)

### Adding custom field to user profile

We want to be able to view and edit the Salesforce Contact ID in the user profile from the Keycloak Admin Portal. 

The steps to enable this are listed below:
1. Select the Realm e.g. `loyalty`
1. Scroll down on the left-hand menu and select **Realm Settings**.
1. From **Realm Settings**, select **User Profile**
1. In **User Profile**, select **Create Attribute**
1. Complete details:
    - Attribute (Name): `customerId`
    - Display Name: `Salesforce Contact Id`
    - Required: `Yes`
1. Save.

![Create CustomerId as user profile attribute](./media/create-customer-id-attribute.gif)

### Including customerId in the Access Token

We want to include the `customerId` in the access token so that we can attribute actions and resources to the corresponding contact in Salesforce.  
In Keycloak, to customise the access token, we need to create a custom **Protocol Mapper** on the `loyalty-client` (the client used for the OAuth2 flow).

The steps are:
1. Select the Realm e.g. `loyalty`
1. Select the Client. In this case `loyalty-client`
1. Select the `Client Scopes` Tab
1. In the `Setup` tab, click on the `$loyalty-client-dedicated` client scope.
1. In the next screen, select `Create new mapper`
1. From the predefined list of mappers, select `User Attribute`
1. Complete details:
    - Name: `Salesforce Contact Id`
    - User Attribute: Select `customerId`
    - Token Name: Enter `customerId`
1. Save

![Add Custom Attribute to JWT](./media/add-custom-attribute-to-jwt.gif)

### Including audience in the Client Credentials Access Token

Keycloak does not include the `aud` field in the access token returned by the `client_credentials` flow. However, this is required for the `express-oauth2-jwt-bearer` library used in this project. 
In Keycloak, to customise the access token, we need to create a custom **Protocol Mapper** and automatically apply it to all clients within the `loyalty-partner` role.

The steps are as follows:

---

## Sign-up

### Configuring admin-cli for user registration

1. Open Keycloak Admin Portal `http://localhost:8080`
1. Select the `master` realm.
1. Select `Clients`
1. Select the `admin-cli` client.
1. Enable `Client authentication` and `Authorization` (`Direct access grants` and `Service accounts roles` should be checked). Save
1. The `Credentials` tab should now be visible. Click on the tab. Copy the client secret to the `.env` file.
1. Navigate to the `Service account roles` tab. Click on `Assign role`. Check:
    - `loyalty-realm`: `manage-users`
    - `loyalty-realm`: `manage-realm`

![Configure `admin-cli` for user registration](./media/configure-admin-cli-for-user-registration.mp4)


---
## Login

### Disabling sign-up on the login screen

A client will be able to request a token for a user from keycloak. 
The member will need to enter their login credentials in a keycloak login form.

We do not want to display the sign-up in the login form, because the sign-up needs to be integrated with Salesforce. 

To disable displaying sign-up in the login form:
1. Switch to the `loyalty` realm
2. Click on `Realm settings`
3. Click on the `Login` tab
4. Disable `User Registration`in the `Login screen customization` section

![Disable Sign-up on Login](./media/disable-sign-up-on-login.png)

### Display Realm Roles in the User Info Endpoint

_This is not required. It is listed for general knowledge_

- This project uses the userinfo endpoint to validate the OAuth2 JWT bearer token.
- After the validation is successful, the roles are extracted from the token so that they can be used to check if the client has the requisite scopes to perform the action it is trying to perform. 
- However, scopes (realm roles) are not returned by default in the userinfo endpoint response. This needs to be enabled using the steps below:

1. Select the Realm e.g. `loyalty`
1. Select the Client e.g. `parnter-1`
1. Select the `Client Scopes` Tab
1. In the `Setup` tab, click on the `${client-name}-dedicated` e.g. `partner-1-dedicated`
1. In the next screen, select `Mappers`. 
1. Click on `Add Mappers` and select `From predefined mappers` from the drop down. Search for realm roles and select it.
1. Once added, click on `realm roles` and in the resulting form, enable return in `user info endpoint`.

![Add Realm Roles to UserInfo endpoint](./media/add-realm-roles-to-userinfo-endpoint.gif)

## Samples

### Sample JWT payload

```json
{
  "exp": 1751916702,
  "iat": 1751916402,
  "jti": "235fcdfa-35d2-4426-93cb-56a56da52ec2",
  "iss": "http://localhost:8080/realms/loyalty",
  "aud": "account",
  "sub": "8b6a99f5-ae78-4be6-9a0e-ef53cc414083",
  "typ": "Bearer",
  "azp": "loyalty-client",
  "sid": "55648008-11fc-4122-868a-d95171a15da4",
  "acr": "1",
  "allowed-origins": [
    "http://localhost:3000"
  ],
  "realm_access": {
    "roles": [
      "offline_access",
      "loyalty-member",
      "default-roles-loyalty",
      "uma_authorization",
      "view-profile"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "profile email",
  "email_verified": true,
  "name": "John Doe",
  "customerId": "003gL00000721XAQAY",
  "preferred_username": "john20250707190156@doe.com",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john20250707190156@doe.com"
}
```