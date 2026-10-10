const StellarSdk = require('@stellar/stellar-sdk');
const {
  generateKeypair,
  fundAccount,
  createPaymentTransaction,
  submitTransaction,
} = require('../src');

// Demonstrates the options-object payment API: attach a memo, override the fee,
// and set an explicit timeout before submitting to testnet.
async function main() {
  const sender = generateKeypair();
  const { publicKey: recipient } = generateKeypair();

  console.log(`Sender   : ${sender.publicKey}`);
  console.log(`Recipient: ${recipient}`);

  try {
    // Friendbot is testnet-only and never touches real funds.
    await fundAccount(sender.publicKey);
    console.log('Sender funded by testnet Friendbot.');

    const xdr = await createPaymentTransaction(sender.secretKey, recipient, '2', {
      memo: 'drips-wave-23',
      fee: '200',
      timeout: 60,
    });
    console.log('Signed transaction XDR:', xdr);

    const tx = StellarSdk.TransactionBuilder.fromXDR(xdr, StellarSdk.Networks.TESTNET);
    console.log(`Decoded memo: ${tx.memo.type} "${tx.memo.value.toString()}"`);

    const result = await submitTransaction(xdr);
    console.log('Payment submitted, hash:', result.hash);
  } catch (error) {
    console.error('Payment workflow failed:', error.message);
    process.exitCode = 1;
  }
}

main();
