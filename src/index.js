const StellarSdk = require('@stellar/stellar-sdk');
const { StellarUtilsError, ErrorCodes } = require('./errors');
const { createServer, isNotFound, resolveNetwork, rethrowHorizon } = require('./network');

const FRIENDBOT_URL = 'https://friendbot.stellar.org';

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

// Stellar amounts use 7-decimal (stroop) precision and are serialized as
// Int64. MAX_STROOPS is 2^63 - 1, the largest value the SDK can encode.
const MAX_STROOPS = 9223372036854775807n;

/**
 * Parse a decimal amount into stroops (1e7 per lumen) using exact BigInt math.
 * Returns null when the amount is not a valid non-negative decimal, or when it
 * needs more than 7 decimal places.
 * @private
 * @param {string} trimmed
 * @returns {bigint|null}
 */
function amountToStroops(trimmed) {
  const match = /^(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const intPart = match[1];
  const fracPart = match[2] || '';
  const exponent = match[3] ? Number(match[3]) : 0;

  const decimalPlaces = Math.max(0, fracPart.length - exponent);
  if (decimalPlaces > 7) {
    return null;
  }

  const shift = 7 - fracPart.length + exponent;
  if (shift < 0) {
    return null;
  }
  return BigInt(intPart + fracPart) * 10n ** BigInt(shift);
}

/**
 * Validate a positive decimal amount suitable for Stellar payments.
 *
 * Mirrors the `@stellar/stellar-sdk` amount rules exactly (BigNumber-based):
 * positive, finite, at most 7 decimal places, and within the Int64 stroop range.
 * Decimal strings are recommended; numbers are accepted and stringified.
 *
 * @param {string|number} amount
 * @returns {boolean}
 */
function validateAmount(amount) {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount) || amount <= 0) {
      return false;
    }
    amount = String(amount);
  } else if (typeof amount !== 'string') {
    return false;
  }

  const trimmed = amount.trim();
  if (!trimmed) {
    return false;
  }

  const stroops = amountToStroops(trimmed);
  return stroops !== null && stroops > 0n && stroops <= MAX_STROOPS;
}

// Memo ids are unsigned 64-bit integers in the Stellar protocol.
const MAX_MEMO_ID = 18446744073709551615n;

/**
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 * @returns {StellarUtilsError}
 * @private
 */
function invalidMemo(message, details) {
  return new StellarUtilsError(ErrorCodes.INVALID_MEMO, message, details ? { details } : {});
}

/**
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 * @returns {StellarUtilsError}
 * @private
 */
function invalidOptions(message, details) {
  return new StellarUtilsError(ErrorCodes.INVALID_OPTIONS, message, details ? { details } : {});
}

/**
 * @param {string} value
 * @returns {import('@stellar/stellar-sdk').Memo}
 * @private
 */
function buildTextMemo(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw invalidMemo('A text memo must be a non-empty string.');
  }
  const bytes = Buffer.byteLength(value, 'utf8');
  if (bytes > 28) {
    throw invalidMemo('A text memo must be 28 UTF-8 bytes or fewer.', { bytes });
  }
  return StellarSdk.Memo.text(value);
}

/**
 * @param {string|number|bigint} value
 * @returns {import('@stellar/stellar-sdk').Memo}
 * @private
 */
function buildIdMemo(value) {
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) {
    throw invalidMemo('A memo id must be a non-negative integer.');
  }
  if (BigInt(str) > MAX_MEMO_ID) {
    throw invalidMemo('A memo id must fit in an unsigned 64-bit integer.');
  }
  return StellarSdk.Memo.id(str);
}

/**
 * @param {'hash'|'return'} type
 * @param {string} value
 * @returns {import('@stellar/stellar-sdk').Memo}
 * @private
 */
function buildHashMemo(type, value) {
  const hex = typeof value === 'string' ? value.trim() : '';
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw invalidMemo(`A ${type} memo must be a 32-byte hex string (64 characters).`);
  }
  return type === 'hash' ? StellarSdk.Memo.hash(hex) : StellarSdk.Memo.return(hex);
}

/**
 * Normalize the many accepted memo shapes into an SDK `Memo`.
 * Accepts a string (text), an integer/number/bigint (id), or an explicit
 * `{ type: 'text'|'id'|'hash'|'return', value }` object.
 * @param {*} memo
 * @returns {import('@stellar/stellar-sdk').Memo|null}
 * @private
 */
function buildMemo(memo) {
  if (memo === undefined || memo === null) {
    return null;
  }
  if (typeof memo === 'string') {
    return buildTextMemo(memo);
  }
  if (typeof memo === 'number' || typeof memo === 'bigint') {
    if (typeof memo === 'number' && !Number.isInteger(memo)) {
      throw invalidMemo('A numeric memo must be an integer id.');
    }
    return buildIdMemo(memo);
  }
  if (typeof memo === 'object') {
    const type = String(memo.type || '').toLowerCase();
    if (type === 'text') {
      return buildTextMemo(memo.value);
    }
    if (type === 'id') {
      return buildIdMemo(memo.value);
    }
    if (type === 'hash' || type === 'return') {
      return buildHashMemo(type, memo.value);
    }
    throw invalidMemo('A memo object needs a type of "text", "id", "hash", or "return".');
  }
  throw invalidMemo('A memo must be a string, an integer id, or a { type, value } object.');
}

/**
 * @param {string|number|bigint} fee
 * @returns {string}
 * @private
 */
function normalizeFee(fee) {
  if (fee === undefined || fee === null) {
    return StellarSdk.BASE_FEE;
  }
  const str = String(fee).trim();
  if (!/^\d+$/.test(str) || BigInt(str) <= 0n) {
    throw invalidOptions('fee must be a positive integer number of stroops.', { fee });
  }
  return str;
}

/**
 * @param {number} timeout
 * @returns {number}
 * @private
 */
function normalizeTimeout(timeout) {
  if (timeout === undefined || timeout === null) {
    return 30;
  }
  if (typeof timeout !== 'number' || !Number.isFinite(timeout) || timeout <= 0) {
    throw invalidOptions('timeout must be a positive number of seconds.', { timeout });
  }
  return Math.floor(timeout);
}

/**
 * @param {Date|number|string} value
 * @param {string} field
 * @returns {number}
 * @private
 */
function toUnixSeconds(value, field) {
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  throw invalidOptions(`timebounds.${field} must be a Date, number, or numeric string.`);
}

/**
 * @param {{ minTime?: Date|number|string, maxTime?: Date|number|string }} timebounds
 * @returns {{ minTime: number, maxTime: number }}
 * @private
 */
function buildTimebounds(timebounds) {
  if (typeof timebounds !== 'object') {
    throw invalidOptions('timebounds must be an object with minTime and/or maxTime.');
  }
  if (
    (timebounds.minTime === undefined || timebounds.minTime === null) &&
    (timebounds.maxTime === undefined || timebounds.maxTime === null)
  ) {
    throw invalidOptions('timebounds must include minTime and/or maxTime.');
  }
  return {
    minTime:
      timebounds.minTime === undefined || timebounds.minTime === null
        ? 0
        : toUnixSeconds(timebounds.minTime, 'minTime'),
    maxTime:
      timebounds.maxTime === undefined || timebounds.maxTime === null
        ? 0
        : toUnixSeconds(timebounds.maxTime, 'maxTime'),
  };
}

/**
 * Build a `changeTrust` operation for a non-native asset. Useful as a pre-op
 * before a payment to an account that does not yet hold the asset.
 *
 * @param {string} assetCode
 * @param {string} assetIssuer
 * @param {string|number} [limit] - Optional trust limit; defaults to the SDK maximum.
 * @returns {import('@stellar/stellar-sdk').xdr.Operation}
 */
function createChangeTrustOperation(assetCode, assetIssuer, limit) {
  const code = String(assetCode || '').trim().toUpperCase();
  if (!code || code.length > 12 || code === 'XLM') {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ASSET,
      'changeTrust requires a non-native asset code of 1-12 characters.',
      { details: { assetCode: code } }
    );
  }
  if (!validateAddress(assetIssuer)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ASSET,
      'changeTrust requires a valid issuer public key.',
      { details: { assetCode: code } }
    );
  }

  const operation = { asset: new StellarSdk.Asset(code, assetIssuer.trim()) };
  if (limit !== undefined && limit !== null) {
    if (!validateAmount(limit)) {
      throw new StellarUtilsError(
        ErrorCodes.INVALID_AMOUNT,
        'changeTrust limit must be a positive decimal number with at most 7 decimal places.',
        { details: { limit } }
      );
    }
    operation.limit = String(limit).trim();
  }

  return StellarSdk.Operation.changeTrust(operation);
}

/**
 * Collect optional pre-payment operations from the options object.
 * Supports raw SDK operations (`preOps`) and a `changeTrust` shorthand.
 * @param {Record<string, unknown>} options
 * @returns {Array<import('@stellar/stellar-sdk').xdr.Operation>}
 * @private
 */
function resolvePreOps(options) {
  const operations = [];

  if (options.changeTrust !== undefined && options.changeTrust !== null) {
    if (!Array.isArray(options.changeTrust)) {
      throw invalidOptions('changeTrust must be an array of { assetCode, assetIssuer, limit? }.');
    }
    for (const entry of options.changeTrust) {
      if (!entry || typeof entry !== 'object') {
        throw invalidOptions('Each changeTrust entry must be an object.');
      }
      operations.push(createChangeTrustOperation(entry.assetCode, entry.assetIssuer, entry.limit));
    }
  }

  if (options.preOps !== undefined && options.preOps !== null) {
    if (!Array.isArray(options.preOps)) {
      throw invalidOptions('preOps must be an array of Stellar operations.');
    }
    operations.push(...options.preOps);
  }

  return operations;
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
 * Check whether a Stellar account exists on the selected network.
 *
 * A missing account (Horizon 404) resolves to `false` so callers can branch
 * without catching errors. Invalid addresses and any other Horizon failure are
 * still thrown as `StellarUtilsError`.
 *
 * @param {string} address
 * @param {string} [network='testnet']
 * @returns {Promise<boolean>}
 */
async function accountExists(address, network = 'testnet') {
  if (!validateAddress(address)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ADDRESS,
      'A valid Stellar public key is required to check an account.',
      { details: { addressType: typeof address } }
    );
  }

  const server = createServer(network);
  try {
    await server.loadAccount(address.trim());
    return true;
  } catch (err) {
    if (isNotFound(err)) {
      return false;
    }
    rethrowHorizon(err, 'accountExists');
  }
}

/**
 * Fund a Stellar account using the testnet Friendbot.
 *
 * Testnet only: calling this with any other network throws INVALID_NETWORK.
 * Never use Friendbot for accounts that hold real value.
 *
 * @param {string} publicKey
 * @param {string} [network='testnet']
 * @returns {Promise<Object>} Parsed Friendbot response (funded account details).
 */
async function fundAccount(publicKey, network = 'testnet') {
  if (network !== 'testnet') {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_NETWORK,
      'Friendbot funding is only available on testnet.',
      { details: { network } }
    );
  }
  if (!validateAddress(publicKey)) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_ADDRESS,
      'A valid Stellar public key is required to fund an account.',
      { details: { addressType: typeof publicKey } }
    );
  }

  const url = `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey.trim())}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new StellarUtilsError(
      ErrorCodes.FRIENDBOT_ERROR,
      'Friendbot request failed. Check your network connection and try again.',
      { cause: err, details: { action: 'fundAccount' } }
    );
  }

  if (!response.ok) {
    let errBody = null;
    try {
      errBody = await response.json();
    } catch (err) {
      errBody = null;
    }

    const detail =
      errBody && typeof errBody === 'object'
        ? typeof errBody.detail === 'string'
          ? errBody.detail
          : typeof errBody.title === 'string'
            ? errBody.title
            : null
        : null;

    const details = { action: 'fundAccount', status: response.status };
    if (detail) {
      details.detail = detail;
    }

    throw new StellarUtilsError(
      ErrorCodes.FRIENDBOT_ERROR,
      detail
        ? `Friendbot rejected the request: ${detail}`
        : 'Friendbot returned a non-OK response. The account may already be funded.',
      { details }
    );
  }

  try {
    return await response.json();
  } catch (err) {
    throw new StellarUtilsError(
      ErrorCodes.FRIENDBOT_ERROR,
      'Friendbot returned a malformed response.',
      { cause: err, details: { action: 'fundAccount' } }
    );
  }
}

/**
 * Build and sign a payment transaction for a Stellar account.
 *
 * Two call styles are supported and fully backward compatible:
 *
 *   1. Positional: `(sourceSecret, destinationAddress, amount, assetCode?, assetIssuer?, network?)`
 *   2. Options:    `(sourceSecret, destinationAddress, amount, options)`
 *
 * The options object may set `assetCode`, `assetIssuer`, and `network` alongside
 * `memo`, `fee`, `timeout`, `timebounds`, `preOps`, and `changeTrust`. An options
 * object may also be appended as the final argument to the positional form.
 *
 * @param {string} sourceSecret
 * @param {string} destinationAddress
 * @param {string} amount
 * @param {string|Object} [assetCode='XLM'] - Asset code, or the options object.
 * @param {string|null} [assetIssuer=null]
 * @param {string} [network='testnet']
 * @param {Object} [options={}]
 * @param {string|number|bigint|Object} [options.memo] - text/id/hash/return memo.
 * @param {string|number|bigint} [options.fee] - Fee per operation, in stroops.
 * @param {number} [options.timeout=30] - Seconds until the transaction expires.
 * @param {{ minTime?: Date|number|string, maxTime?: Date|number|string }} [options.timebounds]
 * @param {Array} [options.preOps] - Raw SDK operations added before the payment.
 * @param {Array<{ assetCode: string, assetIssuer: string, limit?: string|number }>} [options.changeTrust]
 * @returns {Promise<string>} Signed transaction XDR
 */
async function createPaymentTransaction(
  sourceSecret,
  destinationAddress,
  amount,
  assetCode = 'XLM',
  assetIssuer = null,
  network = 'testnet',
  options = {}
) {
  if (assetCode !== null && typeof assetCode === 'object' && !Array.isArray(assetCode)) {
    options = assetCode;
    assetCode = options.assetCode === undefined ? 'XLM' : options.assetCode;
    assetIssuer = options.assetIssuer === undefined ? null : options.assetIssuer;
    network = options.network === undefined ? 'testnet' : options.network;
  }

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw invalidOptions('options must be an object when provided.');
  }

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
      'Amount must be a positive decimal number with at most 7 decimal places.',
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

  // Validate and normalize every option before any network I/O so callers get
  // fast, deterministic failures.
  const fee = normalizeFee(options.fee);
  const timebounds = options.timebounds ? buildTimebounds(options.timebounds) : null;
  const timeout = normalizeTimeout(options.timeout);
  const memo = buildMemo(options.memo);
  const preOps = resolvePreOps(options);

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

  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase: passphrase,
    ...(timebounds ? { timebounds } : {}),
  });

  for (const operation of preOps) {
    builder.addOperation(operation);
  }

  builder.addOperation(
    StellarSdk.Operation.payment({
      destination: destinationAddress.trim(),
      asset,
      amount: String(amount).trim(),
    })
  );

  if (memo) {
    builder.addMemo(memo);
  }

  if (!timebounds) {
    builder.setTimeout(timeout);
  }

  const transaction = builder.build();
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
  createChangeTrustOperation,
  getBalance,
  accountExists,
  fundAccount,
  createPaymentTransaction,
  submitTransaction,
  StellarUtilsError,
  ErrorCodes,
};
