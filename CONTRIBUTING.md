# Contributing to Stellar Utils

Thanks for helping improve this toolkit. This project is intended for real Stellar developer workflows — not bounty farming.

## Before you start

1. Read the [README](README.md) and [API docs](docs/API.md).
2. Agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
3. Search existing issues/PRs to avoid duplicates.
4. For non-trivial work, open an issue first and wait for maintainer feedback.

## Local setup

```bash
git clone https://github.com/Dot-Voidz/Stellar-utils.git
cd Stellar-utils
npm install
npm test
```

## What we accept

Good contributions:

- Correctness bugs in validation, Horizon calls, or transaction building
- Clearer error types and recovery for network/Horizon failures
- Tests that cover edge cases (invalid assets, missing accounts, timeouts)
- Documentation that helps someone ship a Stellar integration faster
- Focused features that belong in a **utils** library (not a full wallet app)

We will close or reject:

- Typo-only or whitespace-only drive-by PRs
- Untested LLM-generated code the author cannot explain
- Duplicate “copy button” / cosmetic-only tasks filed as Wave issues
- Secrets, funded keys, or phishing-adjacent examples

## Issue quality bar

When opening an issue, include:

- **Problem** — what is broken or missing, and who it affects
- **Context** — file paths, SDK version, network (testnet/public)
- **Acceptance criteria** — concrete, testable outcomes
- **Complexity hint** — `trivial` / `medium` / `high` (maintainers confirm)
- **Out of scope** — what this issue is *not*

Use the issue templates under `.github/ISSUE_TEMPLATE/`.

## Pull requests

1. Branch from `main` (`fix/...` or `feat/...`).
2. Keep the diff focused on one issue.
3. Add or update tests when behavior changes.
4. Run `npm test` locally.
5. Fill out the PR template: summary, linked issue, test plan.

## Drips Wave note

If this repository is later accepted into a Drips Wave program, only maintainer-approved issues will be labeled for Wave participation. Do not mass-create trivial issues to inflate activity.
