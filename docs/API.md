# API Reference

Stellar Utils exposes a small set of helper functions for common Stellar workflows.

## Functions

### validateAddress(address)

Validates a Stellar public key.

- Parameters:
  - `address` (string): A Stellar account address to validate.
- Returns:
  - `boolean`: `true` when the address is a valid Ed25519 public key, otherwise `false`.
- Example:

```js
const { validateAddress } = require('stellar-utils');

console.log(validateAddress('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H'));
```

### validateSecretKey(secretKey)

Validates a Stellar secret seed.

- Parameters:
  - `secretKey` (string): A Stellar secret key to validate.
- Returns:
  - `boolean`: `true` when the secret key is valid, otherwise `false`.
- Example:

```js
const { validateSecretKey } = require('stellar-utils');

console.log(validateSecretKey('S...'));
```

### generateKeypair()

Creates a new random Stellar keypair.

- Returns:
  - `Object`: An object with `publicKey` and `secretKey` properties.
- Example:

```js
const { generateKeypair } = require('stellar-utils');

const pair = generateKeypair();
console.log(pair.publicKey);
console.log(pair.secretKey);
```

### getBalance(address, network)

Loads the balances for a Stellar account from Horizon.

- Parameters:
  - `address` (string): The Stellar public key to query.
  - `network` (string, optional): Use `'testnet'` or `'public'`. Defaults to `'testnet'`.
- Returns:
  - `Promise<Array>`: The Horizon account balances array.
- Example:

```js
const { getBalance } = require('stellar-utils');

const balances = await getBalance('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', 'testnet');
console.log(balances);
```

### fundAccount(publicKey, network)

Funds a Stellar account using the **testnet** Friendbot. Testnet only.

- Parameters:
  - `publicKey` (string): The account public key to fund.
  - `network` (string, optional): Must be `'testnet'`. Defaults to `'testnet'`; any other value throws `INVALID_NETWORK`.
- Returns:
  - `Promise<Object>`: The parsed Friendbot response (funded account details).
- Throws:
  - `INVALID_NETWORK` when called for `'public'` or an unknown network.
  - `INVALID_ADDRESS` when `publicKey` is not a valid Ed25519 public key.
  - `FRIENDBOT_ERROR` when the request fails or Friendbot returns a non-OK response.
- Example:

```js
const { generateKeypair, fundAccount } = require('stellar-utils');

const { publicKey } = generateKeypair();
const result = await fundAccount(publicKey); // testnet only
console.log(result);
```

> Never use Friendbot for accounts holding real value. It exists only to fund testnet accounts.

### createPaymentTransaction(sourceSecret, destinationAddress, amount, assetCode, assetIssuer, network)

Builds and signs a payment transaction.

- Parameters:
  - `sourceSecret` (string): The sender's secret key.
  - `destinationAddress` (string): The destination Stellar public key.
  - `amount` (string): The amount to send.
  - `assetCode` (string, optional): The asset code. Defaults to `'XLM'`.
  - `assetIssuer` (string, optional): The asset issuer for non-native assets.
  - `network` (string, optional): `'testnet'` or `'public'`. Defaults to `'testnet'`.
- Returns:
  - `Promise<string>`: A signed transaction XDR string.
- Example:

```js
const { createPaymentTransaction } = require('stellar-utils');

const xdr = await createPaymentTransaction(
  'S...',
  'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
  '1.5'
);
console.log(xdr);
```

### submitTransaction(transactionXDR, network)

Submits a signed transaction to Horizon.

- Parameters:
  - `transactionXDR` (string): The signed transaction XDR.
  - `network` (string, optional): `'testnet'` or `'public'`. Defaults to `'testnet'`.
- Returns:
  - `Promise<Object>`: The Horizon submission result.
- Example:

```js
const { submitTransaction } = require('stellar-utils');

const result = await submitTransaction('AAAA...', 'testnet');
console.log(result);
```

### validateAmount(amount)

Returns `true` when `amount` is a positive decimal string or number suitable for payment builders.

### Errors

Network and validation failures throw `StellarUtilsError` with a stable `code` from `ErrorCodes`.
Callers can branch on `error.code` without parsing message text.

| Code | Meaning |
| --- | --- |
| `INVALID_ADDRESS` | The public key is not a valid Ed25519 address. |
| `INVALID_SECRET` | The secret seed is not a valid Ed25519 secret. |
| `INVALID_AMOUNT` | The amount is not a positive decimal value. |
| `INVALID_ASSET` | A non-native asset is missing a valid issuer public key. |
| `INVALID_NETWORK` | The network is not `testnet` or `public`. |
| `INVALID_XDR` | The transaction XDR is missing or cannot be parsed for the network. |
| `ACCOUNT_NOT_FOUND` | Horizon returned 404 / `NotFoundError` for the requested account. |
| `FRIENDBOT_ERROR` | A testnet Friendbot funding request failed (transport or non-OK response). |
| `HORIZON_ERROR` | Any other Horizon/SDK failure (message preserved, secrets never included). |

Horizon failures wrap the original error as `error.cause` and expose `{ action, status? }` in
`error.details`, so `ACCOUNT_NOT_FOUND` and unknown `HORIZON_ERROR` failures can be handled
separately.

```js
const { getBalance, StellarUtilsError, ErrorCodes } = require('stellar-utils');

try {
  await getBalance('not-valid');
} catch (err) {
  if (err instanceof StellarUtilsError && err.code === ErrorCodes.INVALID_ADDRESS) {
    console.error('Bad address');
  }
}
```

## Best practices

- Use `testnet` during development and only switch to `public` for production deployments.
- Store secret keys in environment variables rather than hard-coding them in scripts.
- Validate addresses and secret keys before sending transactions.
- Prefer explicit error handling around network calls; catch `StellarUtilsError` for stable codes.
