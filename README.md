## Stellar-utils — shared Stellar utilities with frontend, backend, contract scaffold, and tests


## CI / Validation
The repository is configured to validate:

root unit tests via npm test
backend syntax checks
frontend script syntax checks
frontend HTML structure
Soroban contract builds for both contract folders
Notes
Keep the two projects separate to avoid confusion
Use Stellar-utils for shared utilities and contract development
Use Stellar-Wallet-Dashboard for dashboard UI and example scripts
Project	Folder	Purpose	Key files
Stellar-utils	Stellar-utils	Shared Stellar utility library + frontend/backend/contract scaffold	src/, frontend/, backend, contract/, tests/
Stellar-Wallet-Dashboard	Stellar-Wallet-Dashboard	Dashboard demo with backend API aexample scripts	index.html, app.js, backend, contract/, examples/
CI	workflows	Validate tests, syntax, HTML, and Soroban contract builds
