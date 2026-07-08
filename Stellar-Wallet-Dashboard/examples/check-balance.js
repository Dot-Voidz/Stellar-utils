const path = require('path');
const libraryPath = path.join(__dirname, '..', '..', 'src');

const [,, publicKey] = process.argv;

if (!publicKey) {
  console.error('Usage: node check-balance.js <PUBLIC_KEY>');
  process.exit(1);
}

async function main() {
  try {
    const utils = require(libraryPath);
    const balances = await utils.getBalance(publicKey, 'testnet');
    console.log(`Balances for ${publicKey}:`);
    console.log(JSON.stringify(balances, null, 2));
  } catch (err) {
    console.error('Unable to load shared library or fetch balance:', err.message);
    process.exit(1);
  }
}

main();
