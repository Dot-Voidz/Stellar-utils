# Stellar-utils

A lightweight, modular collection of core utility functions designed to streamline development workflows, optimize data handling, and eliminate repetitive boilerplate code.

---

## Features

*   **Modular Architecture:** Import only what you need to keep production builds lean.
*   **Zero Dependencies:** Built entirely on native APIs for maximum performance and compatibility.
*   **Type Safe:** Robust parameter validation and clear return structures.
*   **Extensible:** Clean codebase designed for easy contribution and utility expansion.

---

## Installation & Setup

Clone the repository directly into your project's local directory:

```bash
git clone [https://github.com/Dot-Voidz/Stellar-utils.git](https://github.com/Dot-Voidz/Stellar-utils.git)
Stellar-utils/
├── main/
│   ├── src/          # Source files for utility modules
│   ├── tests/        # Unit tests and validation scripts
│   └── index.js      # Main entry point
├── README.md
└── LICENSE
// Example: Importing standard helpers (adjust syntax based on your runtime environment)
const { formatData, validateInput } = require('./Stellar-utils/main');

const rawData = { user_id: 101, status: " active " };
const cleanData = formatData(rawData);

console.log(cleanData);

npm test
# Or run specific test scripts directly
node main/tests/utils.test.js
