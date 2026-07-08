# Stellar Utils

Useful utilities and developer helpers for Stellar blockchain development.

Contents in this folder:

- `src/` — library source (exports used utilities)
- `tests/` — unit tests
- `frontend/` — example static demo for the utilities
- `backend/` — example Express API wrapping the utilities
- `contract/` — Soroban contract scaffold (Rust)

Quick start

1. Install dependencies for backend (Node.js >= 18) and run tests:

```bash
cd backend
npm install
npm test
```

2. Run the example frontend (static page): open `frontend/index.html` in a browser.

Project layout and purpose

- `frontend/` — Minimal demo UI that uses the backend API or directly imports
  utilities for quick manual testing.
- `backend/` — Small Express server exposing endpoints like `/balance`,
  `/generate-keypair`, `/submit-transaction` that call into `src/`.
- `contract/` — Starter Soroban contract demonstrating a simple escrow-like
  function; intended as a minimal template to extend.

Contributing

Please follow the standard Git workflow. See `CONTRIBUTING.md` for details.

License: GPL-3.0
