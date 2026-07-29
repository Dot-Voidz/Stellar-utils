const StellarSdk = require('@stellar/stellar-sdk');
const { StellarUtilsError, ErrorCodes } = require('./errors');
const { createServer, resolveNetwork, rethrowHorizon } = require('./network');

/**
 * Validate a Stellar public key.
 *
 * @param {string} address - The Stellar address to validate.
 * @returns {boolean} Returns true when the provided public key is a valid Ed25519 address.
 */
function validateAddress(address) {
  if (typeof address !== 'string' || !address.trim()) {
    return false;
  }
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address.trim());
  } catch (e) {
    return false;
  }
}

/**
 * Validate a Stellar secret key.
 *
 * @param {string} secretKey - The Stellar secret key to validate.
 * @returns {boolean} Returns true when the provided secret seed is valid.
 */
function validateSecretKey(secretKey) {
  if (typeof secretKey !== 'string' || !secretKey.trim()) {
    return false;
  }
  try {
    return StellarSdk.StrKey.isValidEd25519SecretSeed(secretKey.trim());
  } catch (e) {
    return false;
  }
}

/**
 * Validate a positive decimal amount string suitable for Stellar payments.
 *
 * @param {string|number} amount
 * @returns {boolean}
 */
function validateAmount(amount) {
  if (typeof amount === 'number') {
    return Number.isFinite(amount) && amount > 0;
  }
  if (typeof amount !== 'string') {
    return false;
  }
  const trimmed = amount.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    return false;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) && value > 0;
}

/**
 * Generate a new Stellar keypair.
 *
 * @returns {{ publicKey: string, secretKey: string }}
 */
function generateKeypair() {
  const pair = StellarSdk.Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

/**
 * Load the balances for a Stellar account from Horizon.
 *
 * @param {string} address
 * @param {string} [network='testnet']
 * @returns {Promise<Array>}
 */
async function getBalance(address, network = 'testnet') {
  if (!validateAddress(address)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ADDRESS,
      'A valid Stellar public key is required to load balances.',
      { details: { addressType: typeof address } }
    );
  }

  const server = createServer(network);
  try {
    const account = await server.loadAccount(address.trim());
    return account.balances;
  } catch (err) {
    rethrowHorizon(err, 'getBalance');
  }
}

/**
 * Build and sign a payment transaction for a Stellar account.
 *
 * @param {string} sourceSecret
 * @param {string} destinationAddress
 * @param {string} amount
 * @param {string} [assetCode='XLM']
 * @param {string|null} [assetIssuer=null]
 * @param {string} [network='testnet']
 * @returns {Promise<string>} Signed transaction XDR
 */
async function createPaymentTransaction(
  sourceSecret,
  destinationAddress,
  amount,
  assetCode = 'XLM',
  assetIssuer = null,
  network = 'testnet'
) {
  if (!validateSecretKey(sourceSecret)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_SECRET,
      'A valid Stellar secret key is required to sign payments.'
    );
  }
  if (!validateAddress(destinationAddress)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ADDRESS,
      'Destination must be a valid Stellar public key.'
    );
  }
  if (!validateAmount(amount)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_AMOUNT,
      'Amount must be a positive decimal number string.',
      { details: { amount } }
    );
  }

  const normalizedCode = String(assetCode || 'XLM').trim().toUpperCase();
  if (normalizedCode !== 'XLM' && !validateAddress(assetIssuer)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ASSET,
      'Non-native assets require a valid issuer public key.',
      { details: { assetCode: normalizedCode } }
    );
  }

  const { passphrase } = resolveNetwork(network);
  const server = createServer(network);
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret.trim());

  let sourceAccount;
  try {
    sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  } catch (err) {
    rethrowHorizon(err, 'createPaymentTransaction.loadAccount');
  }

  const asset =
    normalizedCode === 'XLM'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(normalizedCode, assetIssuer.trim());

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress.trim(),
        asset,
        amount: String(amount).trim(),
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);
  return transaction.toXDR();
}

/**
 * Submit a signed transaction to Horizon.
 *
 * @param {string} transactionXDR
 * @param {string} [network='testnet']
 * @returns {Promise<Object>}
 */
async function submitTransaction(transactionXDR, network = 'testnet') {
  if (typeof transactionXDR !== 'string' || !transactionXDR.trim()) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_XDR,
      'A signed transaction XDR string is required.'
    );
  }

  const { passphrase } = resolveNetwork(network);
  const server = createServer(network);

  let transaction;
  try {
    transaction = new StellarSdk.Transaction(transactionXDR.trim(), passphrase);
  } catch (err) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_XDR,
      'Transaction XDR could not be parsed for the selected network.',
      { cause: err }
    );
  }

  try {
    return await server.submitTransaction(transaction);
  } catch (err) {
    rethrowHorizon(err, 'submitTransaction');
  }
}

module.exports = {
  validateAddress,
  validateSecretKey,
  validateAmount,
  generateKeypair,
  getBalance,
  createPaymentTransaction,
  submitTransaction,
  StellarUtilsError,
  ErrorCodes,
};
