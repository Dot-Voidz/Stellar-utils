const StellarSdk = require('@stellar/stellar-sdk');
const { StellarUtilsError, ErrorCodes } = require('./errors');

const NETWORKS = Object.freeze({
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    passphrase: StellarSdk.Networks.TESTNET,
  },
  public: {
    horizonUrl: 'https://horizon.stellar.org',
    passphrase: StellarSdk.Networks.PUBLIC,
  },
});

/**
 * @param {string} network
 * @returns {{ horizonUrl: string, passphrase: string }}
 */
function resolveNetwork(network = 'testnet') {
  const config = NETWORKS[network];
  if (!config) {
    throw new StellarUtilsError(
      ErrorCodes.INVALID_NETWORK,
      `Unsupported network "${network}". Use "testnet" or "public".`,
      { details: { network } }
    );
  }
  return config;
}

/**
 * @param {string} [network='testnet']
 * @returns {import('@stellar/stellar-sdk').Horizon.Server}
 */
function createServer(network = 'testnet') {
  const { horizonUrl } = resolveNetwork(network);
  return new StellarSdk.Horizon.Server(horizonUrl);
}

/**
 * Extract an HTTP status code from a Horizon/SDK error shape if present.
 * @param {unknown} err
 * @returns {number|undefined}
 */
function horizonStatus(err) {
  if (!err || typeof err !== 'object') {
    return undefined;
  }
  if (err.response && typeof err.response === 'object' && typeof err.response.status === 'number') {
    return err.response.status;
  }
  if (typeof err.status === 'number') {
    return err.status;
  }
  return undefined;
}

/**
 * Wrap Horizon/SDK failures in a stable error type without leaking secrets.
 * A missing account (404 / NotFoundError) becomes ACCOUNT_NOT_FOUND; every
 * other failure is preserved as HORIZON_ERROR.
 * @param {unknown} err
 * @param {string} action
 * @returns {never}
 */
function rethrowHorizon(err, action) {
  const status = horizonStatus(err);
  const notFound = status === 404 || (err && typeof err === 'object' && err.name === 'NotFoundError');

  const code = notFound ? ErrorCodes.ACCOUNT_NOT_FOUND : ErrorCodes.HORIZON_ERROR;
  const fallback = notFound
    ? 'Horizon could not find the requested account.'
    : `Horizon request failed during ${action}`;
  const message =
    (err && typeof err === 'object' && typeof err.message === 'string' && err.message) || fallback;

  const details = { action };
  if (status !== undefined) {
    details.status = status;
  }

  throw new StellarUtilsError(code, String(message), {
    cause: err,
    details,
  });
}

module.exports = {
  NETWORKS,
  resolveNetwork,
  createServer,
  rethrowHorizon,
};
