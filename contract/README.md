Soroban contract (escrow-style) scaffold

This folder contains a minimal Soroban contract implemented with `soroban-sdk`.
It stores a simple balances map and exposes `initialize`, `deposit`,
`withdraw`, and `balance` helper functions. This scaffold is a starting point
— extend it to perform real token transfers or escrow logic as needed.

To build and test (requires Soroban toolchain):

```bash
cargo install --locked --version 0.1.0 soroban-cli || true
cd contract
soroban build
```

See Soroban docs for deploying and invoking the contract on a test network.
