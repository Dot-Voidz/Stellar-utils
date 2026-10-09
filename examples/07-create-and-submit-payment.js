const {
  generateKeypair,
  fundAccount,
  getBalance,
  createPaymentTransaction,
  submitTransaction,
} = require('../src');

// End-to-end testnet workflow: fund a sender, build + sign a payment, submit
// it to Horizon, then read the recipient's balance.
async function main() {
  const sender = generateKeypair();
  const { publicKey: recipient } = generateKeypair();

  console.log(`Sender   : ${sender.publicKey}`);
  console.log(`Recipient: ${recipient}`);

  try {
    // Friendbot is testnet-only and never touches real funds.
    await fundAccount(sender.publicKey);
    console.log('Sender funded by testnet Friendbot.');

    const xdr = await createPaymentTransaction(sender.secretKey, recipient, '1.5');
    console.log('Signed transaction XDR:', xdr);

    const result = await submitTransaction(xdr);
    console.log('Payment submitted, hash:', result.hash);

    const balances = await getBalance(recipient, 'testnet');
    balances.forEach((balance) => {
      console.log(`- ${balance.asset_type}: ${balance.balance}`);
    });
  } catch (error) {
    console.error('Payment workflow failed:', error.message);
    process.exitCode = 1;
  }
}

main();