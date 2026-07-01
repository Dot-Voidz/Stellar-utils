# Stellar Utils

Useful utilities for Stellar blockchain development.

## Installation

```bash
npm install stellar-utils
```

## Usage

```javascript
const { validateAddress, getBalance } = require('stellar-utils');

// Validate a Stellar address
const isValid = validateAddress('G...');

// Get balance of an address
const balance = await getBalance('G...');
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

GPL-3.0
