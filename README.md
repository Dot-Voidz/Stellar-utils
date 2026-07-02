# Stellar Utils

Useful utilities for Stellar blockchain development.

## Installation

```bash
npm install stellar-utils
```

## Usage

### Validate Address
```javascript
const { validateAddress } = require('stellar-utils');

const isValid = validateAddress('GABC123...');
console.log(isValid); // true or false
```

### Validate Secret Key
```javascript
const { validateSecretKey } = require('stellar-utils');

const isValid = validateSecretKey('SDEF456...');
console.log(isValid); // true or false
```

### Generate Keypair
```javascript
const { generateKeypair } = require('stellar-utils');

const pair = generateKeypair();
console.log(pair.publicKey); // G...
console.log(pair.secretKey); // S...
```

### Get Balance
```javascript
const { getBalance } = require('stellar-utils');

// Testnet (default)
const balance = await getBalance('GABC123...');

// Public network
const publicBalance = await getBalance('GABC123...', 'public');
```

### Create Payment Transaction
```javascript
const { createPaymentTransaction } = require('stellar-utils');

const xdr = await createPaymentTransaction(
  'SDEF456...', // Source secret key
  'GABC123...', // Destination address
  '10.5', // Amount
  'XLM', // Asset code (default XLM)
  null, // Asset issuer (required for non-XLM)
  'testnet' // Network (default testnet)
);
```

### Submit Transaction
```javascript
const { submitTransaction } = require('stellar-utils');

const result = await submitTransaction(xdr);
console.log(result);
```

## API Reference

### validateAddress(address)
Validates a Stellar public address.
- **address**: `string` - Stellar address (starts with 'G')
- **returns**: `boolean`

### validateSecretKey(secretKey)
Validates a Stellar secret key.
- **secretKey**: `string` - Stellar secret key (starts with 'S')
- **returns**: `boolean`

### generateKeypair()
Generates a new random Stellar keypair.
- **returns**: `Object` with `publicKey` and `secretKey`

### getBalance(address, network)
Gets the balance of a Stellar address.
- **address**: `string` - Stellar address
- **network**: `string` (optional) - 'testnet' or 'public' (default: 'testnet')
- **returns**: `Promise<Array>` - Array of balances

### createPaymentTransaction(sourceSecret, destination, amount, assetCode, assetIssuer, network)
Creates and signs a payment transaction.
- **sourceSecret**: `string` - Source account secret key
- **destination**: `string` - Destination address
- **amount**: `string` - Amount to send
- **assetCode**: `string` (optional) - Asset code (default: 'XLM')
- **assetIssuer**: `string` (optional) - Asset issuer (required for non-XLM)
- **network**: `string` (optional) - 'testnet' or 'public' (default: 'testnet')
- **returns**: `Promise<string>` - Signed transaction XDR

### submitTransaction(transactionXDR, network)
Submits a signed transaction to the network.
- **transactionXDR**: `string` - Signed transaction XDR
- **network**: `string` (optional) - 'testnet' or 'public' (default: 'testnet')
- **returns**: `Promise<Object>` - Transaction result

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

GPL-3.0
