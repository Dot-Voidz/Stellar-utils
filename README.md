# Stellar Utils

[![CI](https://github.com/Dot-Voidz/Stellar-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/Dot-Voidz/Stellar-utils/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

A small, focused JavaScript toolkit for common Stellar development tasks: key validation, keypair generation, Horizon balance lookups, and payment transaction building/submission. Built on the official [`stellar-sdk`](https://github.com/stellar/js-stellar-sdk).

## Why this exists

Many Stellar tutorials repeat the same Horizon + SDK boilerplate. This library extracts those patterns into tested helpers so apps and scripts can stay small and consistent.

## Features

- Validate Ed25519 public keys and secret seeds
- Generate keypairs
- Load account balances from Horizon (testnet or public)
- Build and sign payment transactions (native XLM or issued assets)
- Submit signed transaction XDR to Horizon
- Runnable examples, API docs, optional Express demo, and a Soroban contract scaffold

## Requirements

- Node.js 18+

## Install (from source)

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
  createPaymentTransaction,
} = require('./src');

const pair = generateKeypair();
console.log(pair.publicKey);
console.log(validateAddress(pair.publicKey));
console.log(validateSecretKey(pair.secretKey));

// Horizon calls (network required)
// const balances = await getBalance(pair.publicKey, 'testnet');
```

See [examples/](examples/) for runnable scripts and [docs/API.md](docs/API.md) for the full API.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/` | Library source |
| `tests/` | Jest unit tests |
| `examples/` | Node scripts for common workflows |
| `docs/` | API reference |
| `frontend/` | Static demo UI |
| `backend/` | Optional Express wrapper |
| `contract/` | Soroban (Rust) scaffold |

## Development

```bash
npm test
node --check backend/index.js
node --check frontend/app.js
```

CI runs tests on Node 18 and 20 and checks demo script syntax on every push and pull request.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening issues or PRs.

We prioritize **impactful** work: correctness, safer error handling, tests, Horizon edge cases, and clear docs. Low-effort typo-only PRs and untested LLM dumps are not accepted.

## Security

If you find a vulnerability (especially around secret-key handling), see [SECURITY.md](SECURITY.md). Never paste real mainnet secret keys into issues, PRs, or examples.

## License

[GPL-3.0](LICENSE)
