# Stellar Utils

[![CI](https://github.com/Dot-Voidz/Stellar-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/Dot-Voidz/Stellar-utils/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

> A small, focused JavaScript toolkit for common Stellar development tasks — key validation, keypair generation, Horizon balance lookups, Friendbot funding, and payment transaction building/submission.

Stellar Utils is built on the official [`@stellar/stellar-sdk`](https://github.com/stellar/js-stellar-sdk) and packages the Horizon + SDK patterns that Stellar tutorials repeat into tested, reusable helpers.

## Table of contents

- [Why Stellar Utils?](#why-stellar-utils)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API overview](#api-overview)
- [Error handling](#error-handling)
- [Examples](#examples)
- [Project structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Why Stellar Utils?

Many Stellar tutorials repeat the same Horizon + SDK boilerplate. This library extracts those patterns into tested helpers so applications and scripts can stay small and consistent — without copy-pasting transaction builders or reinventing validation.

## Features

- **Validation** — validate Ed25519 public keys, secret seeds, and payment amounts.
- **Keypairs** — generate new Stellar keypairs.
- **Balances** — load account balances from Horizon (testnet or public).
- **Account checks** — check whether an account exists on a network without error handling.
- **Funding** — fund testnet accounts via Friendbot (testnet only).
- **Payments** — build and sign payment transactions (native XLM or issued assets).
- **Submission** — submit signed transaction XDR to Horizon.
- **Structured errors** — stable, machine-readable error codes for callers.
- **Tooling** — runnable examples, API docs, an optional Express demo, and a Soroban (Rust) contract scaffold.

## Requirements

- [Node.js](https://nodejs.org) 18 or newer.

## Installation

Install directly from source:

```bash
git clone https://github.com/Dot-Voidz/Stellar-utils.git
cd Stellar-utils
npm install
```

## Quick start

```js
const {
  generateKeypair,
  validateAddress,
  validateSecretKey,
  getBalance,
  fundAccount,
  createPaymentTransaction,
} = require('./src');

const pair = generateKeypair();
console.log(pair.publicKey);
console.log(validateAddress(pair.publicKey));
console.log(validateSecretKey(pair.secretKey));

// Horizon calls require a network connection.
// await fundAccount(pair.publicKey);                    // testnet Friendbot only
// const balances = await getBalance(pair.publicKey, 'testnet');
```

See [`examples/`](examples/) for runnable scripts and [`docs/API.md`](docs/API.md) for the full reference.

## API overview

| Function | Returns | Description |
| --- | --- | --- |
| `validateAddress(address)` | `boolean` | Validate a Stellar Ed25519 public key. |
| `validateSecretKey(secretKey)` | `boolean` | Validate a Stellar Ed25519 secret seed. |
| `validateAmount(amount)` | `boolean` | Validate a positive decimal amount. |
| `generateKeypair()` | `{ publicKey, secretKey }` | Generate a new random keypair. |
| `getBalance(address, network?)` | `Promise<Array>` | Load account balances from Horizon. |
| `accountExists(address, network?)` | `Promise<boolean>` | Check whether an account exists on a network (`false` for missing accounts). |
| `fundAccount(publicKey, network?)` | `Promise<Object>` | Fund a testnet account via Friendbot (testnet only). |
| `createPaymentTransaction(sourceSecret, destinationAddress, amount, assetCode?, assetIssuer?, network?)` | `Promise<string>` | Build and sign a payment transaction, returning signed XDR. |
| `submitTransaction(transactionXDR, network?)` | `Promise<Object>` | Submit a signed transaction XDR to Horizon. |

`network` accepts `'testnet'` (default) or `'public'`. See [`docs/API.md`](docs/API.md) for parameter details.

## Error handling

All validation and network failures throw a `StellarUtilsError` with a stable `code`, so callers can branch on the error without parsing message text.

```js
const { getBalance, StellarUtilsError, ErrorCodes } = require('./src');

try {
  await getBalance('not-a-valid-key');
} catch (err) {
  if (err instanceof StellarUtilsError && err.code === ErrorCodes.INVALID_ADDRESS) {
    console.error('Please provide a valid Stellar address.');
  }
}
```

| Code | Meaning |
| --- | --- |
| `INVALID_ADDRESS` | The public key is not a valid Ed25519 address. |
| `INVALID_SECRET` | The secret seed is not a valid Ed25519 secret. |
| `INVALID_AMOUNT` | The amount is not a positive decimal value, exceeds 7 decimal places, or is too large to serialize. |
| `INVALID_ASSET` | A non-native asset is missing a valid issuer public key. |
| `INVALID_NETWORK` | The network is not `testnet` or `public`. |
| `INVALID_XDR` | The transaction XDR is missing or cannot be parsed. |
| `ACCOUNT_NOT_FOUND` | Horizon returned 404 / `NotFoundError` for the account. |
| `FRIENDBOT_ERROR` | A testnet Friendbot funding request failed. |
| `HORIZON_ERROR` | Any other Horizon/SDK failure. |

## Examples

The [`examples/`](examples/) directory contains runnable Node.js scripts:

| Example | Description |
| --- | --- |
| [`01-validate-address.js`](examples/01-validate-address.js) | Validate a Stellar public key. |
| [`02-validate-secret-key.js`](examples/02-validate-secret-key.js) | Validate a Stellar secret seed. |
| [`03-generate-keypair.js`](examples/03-generate-keypair.js) | Create a new testnet-ready keypair. |
| [`04-check-balance.js`](examples/04-check-balance.js) | Load an account balance from Horizon. |
| [`05-generate-and-validate.js`](examples/05-generate-and-validate.js) | Generate a keypair and validate it. |
| [`06-fund-testnet-account.js`](examples/06-fund-testnet-account.js) | Fund an account via testnet Friendbot. |
| [`07-create-and-submit-payment.js`](examples/07-create-and-submit-payment.js) | Build, sign, and submit a testnet payment, then read the recipient balance. |
| [`08-check-account-exists.js`](examples/08-check-account-exists.js) | Check whether an account exists on the testnet. |

Run any example from the project root:

```bash
node examples/01-validate-address.js
```

## Project structure

| Path | Purpose |
| --- | --- |
| `src/` | Library source. |
| `tests/` | Jest unit tests. |
| `examples/` | Node scripts for common workflows. |
| `docs/` | API reference. |
| `frontend/` | Static demo UI. |
| `backend/` | Optional Express wrapper. |
| `contract/` | Soroban (Rust) contract scaffold. |

## Development

```bash
npm test              # run the Jest test suite
npm run test:watch    # run tests in watch mode
npm run check         # syntax-check src, backend, frontend, and examples
```

CI runs the test suite on Node.js 18 and 20, syntax-checks the demo scripts and helpers, validates the frontend markup, and checks that the Soroban contract compiles.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening issues or pull requests.

We prioritize **impactful** work: correctness, safer error handling, tests, Horizon edge cases, and clear documentation. Low-effort typo-only pull requests and untested LLM dumps are not accepted.

## Security

If you discover a vulnerability — especially around secret-key handling — please see [SECURITY.md](SECURITY.md). Never paste real mainnet secret keys into issues, pull requests, or examples.

## License

Released under the [GPL-3.0](LICENSE) license.
