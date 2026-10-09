const { generateKeypair, accountExists } = require('../src');

// Check whether an account exists on testnet. accountExists resolves to a
// boolean, so unknown accounts are not treated as errors.
async function main() {
  // Use a known testnet account when available, otherwise check a fresh keypair
  // that almost certainly does not exist yet.
  const address =
    process.env.STELLAR_TESTNET_ADDRESS || generateKeypair().publicKey;

  try {
    const exists = await accountExists(address, 'testnet');
    console.log(`Account ${address} exists on testnet: ${exists}`);
  } catch (error) {
    console.error('Unable to check account:', error.message);
    process.exitCode = 1;
  }
}

main();