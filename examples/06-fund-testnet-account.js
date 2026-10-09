const { generateKeypair, fundAccount, getBalance } = require('../src');

async function main() {
  // Friendbot is testnet-only and never touches real funds.
  const { publicKey, secretKey } = generateKeypair();
  console.log(`New testnet keypair:\n  public: ${publicKey}\n  secret: ${secretKey}`);

  try {
    const result = await fundAccount(publicKey);
    console.log('Friendbot funded the account:', JSON.stringify(result, null, 2));

    const balances = await getBalance(publicKey, 'testnet');
    balances.forEach((balance) => {
      console.log(`- ${balance.asset_type}: ${balance.balance}`);
    });
  } catch (error) {
    console.error('Unable to fund account:', error.message);
    process.exitCode = 1;
  }
}

main();
