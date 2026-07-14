const { getBalance } = require('../src');

async function main() {
  // Use a testnet account when available, otherwise fall back to a sample address.
  const address = process.env.STELLAR_TESTNET_ADDRESS || 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

  try {
    const balances = await getBalance(address, 'testnet');
    console.log(`Balances for ${address}:`);
    balances.forEach((balance) => {
      console.log(`- ${balance.asset_type}: ${balance.balance}`);
    });
  } catch (error) {
    console.error('Unable to load balances:', error.message);
    process.exitCode = 1;
  }
}

main();
