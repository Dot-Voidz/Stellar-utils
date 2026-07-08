# Stellar Wallet Dashboard (local scaffold)

A simple dashboard scaffold for experimenting with Stellar wallet flows.
This repository contains a static frontend demo, backend API examples, and
contract scaffolding for local development.

## Contents

- `index.html` — static dashboard UI
- `app.js` — frontend interaction logic
- `backend/` — Express API server for generating keypairs and demo endpoints
- `contract/` — Soroban contract scaffold
- `examples/` — runnable demo scripts for keypair generation and balance checks

## Getting Started

1. Install backend dependencies:

```bash
cd Stellar-Wallet-Dashboard/backend
npm install
```

2. Start the backend service:

```bash
npm start
```

3. Open `Stellar-Wallet-Dashboard/index.html` in your browser to run the demo.

## Dashboard Examples

The `examples/` folder includes:

- `generate-keypair.js` — generates a Stellar keypair using the shared library
- `check-balance.js` — retrieves balances for a public testnet account

Run them from the project root:

```bash
node Stellar-Wallet-Dashboard/examples/generate-keypair.js
node Stellar-Wallet-Dashboard/examples/check-balance.js G...PUBLIC_KEY...
```

## Continuous Integration

This project is validated as part of the repository CI pipeline:

- backend and frontend script syntax checks
- frontend HTML validation
- Soroban contract builds for both contract folders

## Contribution

If you want to extend the dashboard, consider adding:

- wallet loading and account recovery
- payment submission flow
- account balance refresh and error handling

## License

This project follows the repository license at the root.
