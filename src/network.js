const StellarSdk = require('stellar-sdk');
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
 * @returns {import('stellar-sdk').Server}
 */
function createServer(network = 'testnet') {
  const { horizonUrl } = resolveNetwork(network);
  return new StellarSdk.Server(horizonUrl);
}

/**
 * Wrap Horizon/SDK failures in a stable error type without leaking secrets.
 * @param {unknown} err
 * @param {string} action
 * @returns {never}
 */
function rethrowHorizon(err, action) {
  const message =
    (err && typeof err === 'object' && 'message' in err && err.message) ||
    `Horizon request failed during ${action}`;
  throw new StellarUtilsError(ErrorCodes.HORIZON_ERROR, String(message), {
    cause: err,
    details: { action },
  });
}

module.exports = {
  NETWORKS,
  resolveNetwork,
  createServer,
  rethrowHorizon,
};
