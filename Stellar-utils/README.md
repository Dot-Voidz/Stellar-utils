# Stellar Utils

Useful utilities and developer helpers for Stellar blockchain development.

## Quick start

Install the package dependencies and try the core helpers directly from Node.js:

```bash
npm install
node -e "const { generateKeypair, validateAddress, validateSecretKey } = require('./src'); const pair = generateKeypair(); console.log(pair.publicKey); console.log(validateAddress(pair.publicKey)); console.log(validateSecretKey(pair.secretKey));"
```

### Copy-paste examples

Validate a public key:

```js
const { validateAddress } = require('stellar-utils');
console.log(validateAddress('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H'));
```

Validate a secret key:

```js
const { validateSecretKey } = require('stellar-utils');
console.log(validateSecretKey('S...'));
```

Generate a keypair:

```js
const { generateKeypair } = require('stellar-utils');
const pair = generateKeypair();
console.log(pair.publicKey);
console.log(pair.secretKey);
```

Check an account balance:

```js
const { getBalance } = require('stellar-utils');
const balances = await getBalance('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', 'testnet');
console.log(balances);
```

Create a payment transaction:

```js
const { createPaymentTransaction } = require('stellar-utils');
const xdr = await createPaymentTransaction('S...', 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', '1.5');
console.log(xdr);
```

## Project layout

- `src/` — library source (exports the utilities)
- `tests/` — unit tests
- `examples/` — runnable Node.js examples for the main workflows
- `docs/` — API reference and usage guidance
- `frontend/` — example static demo for the utilities
- `backend/` — example Express API wrapping the utilities
- `contract/` — Soroban contract scaffold (Rust)

## Examples and reference

- See [examples/README.md](examples/README.md) for runnable scripts.
- See [docs/API.md](docs/API.md) for the full API guide and best practices.

## Continuous Integration

This repository includes GitHub Actions workflows that run on every push and
pull request:

- `ci.yml` — root CI job that installs dependencies, executes unit tests,
  checks backend and frontend script syntax, validates frontend HTML, and
  builds both Soroban contracts.
- `build-contracts.yml` — isolated contract build workflow for `contract/`
  and `Stellar-Wallet-Dashboard/contract/`.

To run the CI checks locally, use:

```bash
npm test
node --check backend/index.js
node --check frontend/app.js
```

For contract verification, install the Rust toolchain and Soroban CLI locally:

```bash
rustup install stable
cargo install --locked soroban-cli
cd contract && soroban build
```

Dashboard examples

- `Stellar-Wallet-Dashboard/examples/generate-keypair.js`
- `Stellar-Wallet-Dashboard/examples/check-balance.js`

These scripts demonstrate how to use the shared Stellar utility library and
how to call the dashboard backend.

Contributing

Please follow the repository workflow and see `CONTRIBUTING.md` for issue
triage, branch naming, and pull request expectations.

License: GPL-3.0
