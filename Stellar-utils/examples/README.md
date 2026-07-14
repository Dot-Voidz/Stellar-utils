# Examples

This folder contains runnable Node.js scripts that demonstrate the main Stellar Utils workflows.

## Available examples

- [01-validate-address.js](./01-validate-address.js) — validates a Stellar public key.
- [02-validate-secret-key.js](./02-validate-secret-key.js) — validates a Stellar secret seed.
- [03-generate-keypair.js](./03-generate-keypair.js) — creates a new testnet-ready keypair.
- [04-check-balance.js](./04-check-balance.js) — loads an account balance from Horizon.
- [05-create-payment.js](./05-create-payment.js) — creates and submits a payment transaction on testnet.
- [06-submit-transaction.js](./06-submit-transaction.js) — submits a signed transaction XDR.

## Running the examples

From the package root, run any example with Node.js:

```bash
node examples/01-validate-address.js
```

Some examples use the testnet and may require network access. If you want to target a specific account, set the environment variable:

```bash
STELLAR_TESTNET_ADDRESS=GB... node examples/04-check-balance.js
```
