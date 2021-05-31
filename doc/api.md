# Privachat: API

## Available routes

- [Create new account](#create-new-account)
- [Login](#login)

## Response message

All responses will be represent in JSON format with two keys:

- **msg_type** indicate the status of expected result (success or error).
- **msg** give more information.

Example:

```json
{
  "msg_type": "success",
  "msg": "User has been created"
}
```

All messages can be found at
[message_constants](../src/helpers/message_constants.ts).

## Make request

### Fetch API

Request can be made via Fetch API with the following structure

```js
const body = new URLSearchParams({
  key: value,
});

fetch(URL, {
  method: "POST",
  body,
}).then((r) => r.json()).then((j) => {
  // do anything
});
```

## Authentication

### Create new account

Create new account.

- URL: **/create_new_account** (**POST**)
- Expected body:
  - hashed_username: string(exact 64 characters in length) - SHA256 with hex
    encoding
  - auth_password: string(exact 128 characters in length) - SHA512 with hex
    encoding
  - public_key: string - OpenPGPJS public key
  - encrypted_private_key: string - OpenPGPJS encrypted private key
- Expected result: User account will be created and appear in the database. Then
  user can use their credential to login to the system.

### Login

Login to the system.

- URL: **/login** (**POST**)
- Expected body:
  - hashed_username: string(exact 64 characters in length) - SHA256 with hex
    encoding
  - auth_password: string(exact 128 characters in length) - SHA512 with hex
    encoding
- Expected result: **access_token** cookies will be set.

**access_token** is Json Web Token with structure looks like

```json
{
  "usr": "hashed username",
  "exp": "expiration time"
}
```
