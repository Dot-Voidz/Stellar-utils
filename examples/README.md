# Examples

This folder contains runnable Node.js scripts that demonstrate the main Stellar Utils workflows.

## Available examples

- [01-validate-address.js](./01-validate-address.js) — validates a Stellar public key.
- [02-validate-secret-key.js](./02-validate-secret-key.js) — validates a Stellar secret seed.
- [03-generate-keypair.js](./03-generate-keypair.js) — creates a new testnet-ready keypair.
- [04-check-balance.js](./04-check-balance.js) — loads an account balance from Horizon.
- [05-generate-and-validate.js](./05-generate-and-validate.js) — generates a keypair and validates it.
- [06-fund-testnet-account.js](./06-fund-testnet-account.js) — funds a new account via testnet Friendbot and reads its balance.
- [07-create-and-submit-payment.js](./07-create-and-submit-payment.js) — builds, signs, and submits a testnet payment, then reads the recipient balance.
- [08-check-account-exists.js](./08-check-account-exists.js) — checks whether an account exists on testnet.

## Running the examples

From the package root, run any example with Node.js:

```bash
node examples/01-validate-address.js
```

Some examples use the testnet and may require network access. If you want to target a specific account, set the environment variable:

```bash
STELLAR_TESTNET_ADDRESS=GB... node examples/04-check-balance.js
```
