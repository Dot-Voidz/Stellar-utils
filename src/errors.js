/**
 * Structured errors for library callers.
 */
class StellarUtilsError extends Error {
  /**
   * @param {string} code - Stable machine-readable code.
   * @param {string} message - Human-readable explanation.
   * @param {{ cause?: unknown, details?: Record<string, unknown> }} [options]
   */
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'StellarUtilsError';
    this.code = code;
    this.details = options.details || {};
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

const ErrorCodes = Object.freeze({
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_SECRET: 'INVALID_SECRET',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ASSET: 'INVALID_ASSET',
  INVALID_NETWORK: 'INVALID_NETWORK',
  INVALID_XDR: 'INVALID_XDR',
  HORIZON_ERROR: 'HORIZON_ERROR',
});

module.exports = {
  StellarUtilsError,
  ErrorCodes,
};
