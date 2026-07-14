const StellarSdk = require('stellar-sdk');

/**
 * Validate a Stellar public key.
 *
 * @param {string} address - The Stellar address to validate.
 * @returns {boolean} Returns true when the provided public key is a valid Ed25519 address.
 * @example
 * const { validateAddress } = require('stellar-utils');
 * console.log(validateAddress('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H'));
 */
function validateAddress(address) {
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address);
  } catch (e) {
    return false;
  }
}

/**
 * Validate a Stellar secret key.
 *
 * @param {string} secretKey - The Stellar secret key to validate.
 * @returns {boolean} Returns true when the provided secret seed is valid.
 * @example
 * const { validateSecretKey } = require('stellar-utils');
 * console.log(validateSecretKey('S...'));
 */
function validateSecretKey(secretKey) {
  try {
    return StellarSdk.StrKey.isValidEd25519SecretSeed(secretKey);
  } catch (e) {
    return false;
  }
}

/**
 * Generate a new Stellar keypair.
 *
 * @returns {{ publicKey: string, secretKey: string }} An object containing the generated public and secret keys.
 * @example
 * const { generateKeypair } = require('stellar-utils');
 * const pair = generateKeypair();
 * console.log(pair.publicKey);
 */
function generateKeypair() {
  const pair = StellarSdk.Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret()
  };
}

/**
 * Load the balances for a Stellar account from Horizon.
 *
 * @param {string} address - The Stellar account address to query.
 * @param {string} [network='testnet'] - The network to use, either 'testnet' or 'public'.
 * @returns {Promise<Array>} A promise that resolves to the list of account balances.
 * @example
 * const { getBalance } = require('stellar-utils');
 * const balances = await getBalance('GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', 'testnet');
 */
async function getBalance(address, network = 'testnet') {
  const server = network === 'public' 
    ? new StellarSdk.Server('https://horizon.stellar.org')
    : new StellarSdk.Server('https://horizon-testnet.stellar.org');

  const account = await server.loadAccount(address);
  return account.balances;
}

/**
 * Build and sign a payment transaction for a Stellar account.
 *
 * @param {string} sourceSecret - The sender's secret key.
 * @param {string} destinationAddress - The destination Stellar address.
 * @param {string} amount - The amount to send.
 * @param {string} [assetCode='XLM'] - The asset code to send. Defaults to 'XLM'.
 * @param {string} [assetIssuer=null] - The asset issuer for non-native assets.
 * @param {string} [network='testnet'] - The network to use, either 'testnet' or 'public'.
 * @returns {Promise<string>} A promise that resolves to the signed transaction XDR.
 * @example
 * const { createPaymentTransaction } = require('stellar-utils');
 * const xdr = await createPaymentTransaction('S...', 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', '1.5');
 */
async function createPaymentTransaction(sourceSecret, destinationAddress, amount, assetCode = 'XLM', assetIssuer = null, network = 'testnet') {
  const server = network === 'public' 
    ? new StellarSdk.Server('https://horizon.stellar.org')
    : new StellarSdk.Server('https://horizon-testnet.stellar.org');
  
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  
  let asset;
  if (assetCode === 'XLM') {
    asset = StellarSdk.Asset.native();
  } else {
    asset = new StellarSdk.Asset(assetCode, assetIssuer);
  }
  
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: network === 'public' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: destinationAddress,
      asset: asset,
      amount: amount
    }))
    .setTimeout(30)
    .build();
  
  transaction.sign(sourceKeypair);
  return transaction.toXDR();
}

/**
 * Submit a signed transaction to Horizon.
 *
 * @param {string} transactionXDR - The signed transaction XDR to submit.
 * @param {string} [network='testnet'] - The network to use, either 'testnet' or 'public'.
 * @returns {Promise<Object>} A promise that resolves to the submission response.
 * @example
 * const { submitTransaction } = require('stellar-utils');
 * const result = await submitTransaction('AAAA...', 'testnet');
 */
async function submitTransaction(transactionXDR, network = 'testnet') {
  const server = network === 'public' 
    ? new StellarSdk.Server('https://horizon.stellar.org')
    : new StellarSdk.Server('https://horizon-testnet.stellar.org');
  
  const transaction = new StellarSdk.Transaction(transactionXDR, network === 'public' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET);
  return await server.submitTransaction(transaction);
}

module.exports = {
  validateAddress,
  validateSecretKey,
  generateKeypair,
  getBalance,
  createPaymentTransaction,
  submitTransaction
};
