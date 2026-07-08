# Stellar Utils Backend

A professional Express-based backend service for the Stellar-utils repository. This module provides example API endpoints for service health, Stellar keypair generation, and shared library integration.

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [API Reference](#api-reference)
  - [GET /api/health](#get-apihealth)
  - [GET /api/generate-keypair](#get-apigenerate-keypair)
- [Implementation Details](#implementation-details)
- [Testing](#testing)
- [Continuous Integration](#continuous-integration)
- [Extending the Backend](#extending-the-backend)
- [License](#license)

## Overview

The backend is designed for local development and integration testing. It serves as a standalone Express service while also demonstrating how to consume shared Stellar utilities from the repository root.

## Repository Structure

```text
backend/
  ├─ index.js
  ├─ package.json
  └─ package-lock.json

src/
  ├─ index.js
  └─ ...
```

- `backend/index.js` contains the Express application and route definitions.
- `backend/package.json` defines runtime dependencies for the backend service.
- `src/index.js` contains shared Stellar utility functions used by the backend when available.

## Prerequisites

- Node.js 18 or newer
- npm 10 or newer
- Optional: internet access for route examples that may call Stellar testnet services

## Installation

Install the backend dependencies from the repository root:

```bash
cd backend
npm install
```

## Running Locally

Start the backend server:

```bash
npm start
```

By default, the application listens on `http://localhost:4000`.

If you need a custom port, set the `PORT` environment variable before starting:

```bash
PORT=5000 npm start
```

## API Reference

### GET /api/health

Returns the runtime health status for the backend service.

Response:

```json
{
  "status": "ok"
}
```

### GET /api/generate-keypair

Generates a new Stellar keypair.

Behavior:

- Attempts to load the shared repository utility from `../../src`
- Uses `src/index.js` when available
- Falls back to demo values if the library cannot be loaded

Response example:

```json
{
  "publicKey": "GABCDEFGH1234567...",
  "secretKey": "SABCDEFGH1234567..."
}
```

## Implementation Details

The backend is intentionally simple and maintainable.

Key patterns:

- `express.json()` middleware for request handling
- route definitions are declared in a single file for easy extension
- fallback behavior is implemented inside the `/api/generate-keypair` route
- the service logs a startup confirmation message with the selected port

### Backend startup flow

1. Load dependencies
2. Initialize Express app
3. Register `/api/health` and `/api/generate-keypair`
4. Attempt to load the shared Stellar utility library
5. Start listening on the configured port

## Testing

This backend does not include backend-specific unit tests in the scaffold, but the repository includes shared root tests.

To run repository tests:

```bash
npm test
```

For backend-specific validation, you can also verify syntax:

```bash
node --check backend/index.js
```

## Continuous Integration

A GitHub Actions workflow is configured for the repository to validate:

- root unit tests (`npm test`)
- backend syntax checking
- frontend script syntax checking
- contract build verification for both contract folders

This backend README is aligned with the CI automation and local development experience.

## Extending the Backend

Suggested improvements for contributors:

- Add `POST /api/submit-transaction` to build and submit Stellar transactions
- Add `GET /api/balance/:accountId` to retrieve Horizon account balances
- Add request validation and structured error responses
- Add unit tests and integration tests for backend routes

## License

This backend is covered by the same license as the repository root.
