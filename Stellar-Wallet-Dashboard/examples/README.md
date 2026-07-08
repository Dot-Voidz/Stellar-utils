# Stellar Wallet Dashboard Examples

This directory contains demo scripts for the Stellar Wallet Dashboard.

The examples show how to:
- generate a Stellar keypair from the shared utility library
- check a public account balance using the shared Stellar utility library

## Setup

1. In `Stellar-Wallet-Dashboard/backend`, install dependencies if needed:

```bash
npm install
```

2. Start the backend server:

```bash
npm start
```

3. In a new terminal, run one of the demo scripts from this folder.

## Scripts

- `generate-keypair.js` - generates a new Stellar keypair using the shared `src` library, or falls back to the dashboard backend endpoint.
- `check-balance.js <PUBLIC_KEY>` - prints the account balances for a public key using the shared `src` library.

## Example

```bash
node generate-keypair.js
node check-balance.js G...YOUR_PUBLIC_KEY...
```

> The examples are designed for local development and learning. They demonstrate how the dashboard backend and shared Stellar utilities work together.
