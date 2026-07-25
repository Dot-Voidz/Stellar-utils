# Security Policy

## Supported versions

Security fixes are applied on the `main` branch of this repository.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems that could
put user funds or secret keys at risk.

Instead:

1. Open a private [GitHub Security Advisory](https://github.com/Dot-Voidz/Stellar-utils/security/advisories/new) if available, or
2. Contact an organization owner via GitHub with a clear description, reproduction steps, and impact assessment.

We aim to acknowledge reports within 7 days.

## Safe contribution practices

- Never commit real mainnet secret keys, mnemonics, or funded account credentials.
- Prefer testnet for all examples and CI.
- Treat any code that handles `S...` secret seeds as sensitive; avoid logging secrets.
- Validate inputs before calling Horizon or signing transactions.
