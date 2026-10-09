const {
  validateAddress,
  validateSecretKey,
  validateAmount,
  generateKeypair,
  getBalance,
  fundAccount,
  createPaymentTransaction,
  StellarUtilsError,
  ErrorCodes,
} = require('../src/index');

describe('Stellar Utils', () => {
  describe('validateAddress', () => {
    test('should return true for valid address', () => {
      const { publicKey } = generateKeypair();
      expect(validateAddress(publicKey)).toBe(true);
    });

    test('should return false for invalid address', () => {
      expect(validateAddress('invalid')).toBe(false);
      expect(validateAddress('')).toBe(false);
      expect(validateAddress(null)).toBe(false);
      expect(validateAddress(undefined)).toBe(false);
    });
  });

  describe('validateSecretKey', () => {
    test('should return true for valid secret key', () => {
      const { secretKey } = generateKeypair();
      expect(validateSecretKey(secretKey)).toBe(true);
    });

    test('should return false for invalid secret key', () => {
      expect(validateSecretKey('invalid')).toBe(false);
      expect(validateSecretKey('')).toBe(false);
      expect(validateSecretKey(null)).toBe(false);
    });
  });

  describe('validateAmount', () => {
    test('accepts positive decimal strings and numbers', () => {
      expect(validateAmount('1')).toBe(true);
      expect(validateAmount('1.5')).toBe(true);
      expect(validateAmount(2)).toBe(true);
    });

    test('rejects non-positive or malformed amounts', () => {
      expect(validateAmount('0')).toBe(false);
      expect(validateAmount('-1')).toBe(false);
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount('')).toBe(false);
      expect(validateAmount(null)).toBe(false);
    });
  });

  describe('generateKeypair', () => {
    test('should generate a valid keypair', () => {
      const pair = generateKeypair();
      expect(pair.publicKey).toBeDefined();
      expect(pair.secretKey).toBeDefined();
      expect(validateAddress(pair.publicKey)).toBe(true);
      expect(validateSecretKey(pair.secretKey)).toBe(true);
    });
  });

  describe('input guards', () => {
    test('getBalance throws INVALID_ADDRESS for bad keys', async () => {
      await expect(getBalance('not-a-key')).rejects.toMatchObject({
        name: 'StellarUtilsError',
        code: ErrorCodes.INVALID_ADDRESS,
      });
    });

    test('createPaymentTransaction validates inputs before network I/O', async () => {
      const { secretKey, publicKey } = generateKeypair();

      await expect(
        createPaymentTransaction('bad-secret', publicKey, '1')
      ).rejects.toBeInstanceOf(StellarUtilsError);

      await expect(
        createPaymentTransaction(secretKey, 'bad-dest', '1')
      ).rejects.toMatchObject({ code: ErrorCodes.INVALID_ADDRESS });

      await expect(
        createPaymentTransaction(secretKey, publicKey, '0')
      ).rejects.toMatchObject({ code: ErrorCodes.INVALID_AMOUNT });

      await expect(
        createPaymentTransaction(secretKey, publicKey, '1', 'USDC', 'not-issuer')
      ).rejects.toMatchObject({ code: ErrorCodes.INVALID_ASSET });
    });
  });

  describe('Horizon error mapping', () => {
    const { rethrowHorizon } = require('../src/network');

    function capture(fn) {
      try {
        fn();
      } catch (err) {
        return err;
      }
      throw new Error('Expected function to throw');
    }

    test('maps a 404 Horizon response to ACCOUNT_NOT_FOUND', () => {
      const horizonError = Object.assign(new Error('Resource Missing'), {
        name: 'NotFoundError',
        response: { status: 404, statusText: 'Not Found' },
      });

      const err = capture(() => rethrowHorizon(horizonError, 'getBalance'));

      expect(err).toBeInstanceOf(StellarUtilsError);
      expect(err.code).toBe(ErrorCodes.ACCOUNT_NOT_FOUND);
      expect(err.details).toEqual({ action: 'getBalance', status: 404 });
      expect(err.cause).toBe(horizonError);
    });

    test('maps a NotFoundError by name even without a status code', () => {
      const horizonError = Object.assign(new Error('missing'), { name: 'NotFoundError' });

      const err = capture(() => rethrowHorizon(horizonError, 'submitTransaction'));

      expect(err.code).toBe(ErrorCodes.ACCOUNT_NOT_FOUND);
      expect(err.message).toBe('missing');
    });

    test('preserves HORIZON_ERROR for unknown failures', () => {
      const boom = new Error('rate limited');
      boom.response = { status: 429 };

      const err = capture(() => rethrowHorizon(boom, 'submitTransaction'));

      expect(err.code).toBe(ErrorCodes.HORIZON_ERROR);
      expect(err.message).toBe('rate limited');
      expect(err.details).toEqual({ action: 'submitTransaction', status: 429 });
      expect(err.cause).toBe(boom);
    });

    test('falls back to a safe message for status-only errors', () => {
      const err = capture(() => rethrowHorizon({ response: { status: 404 } }, 'getBalance'));

      expect(err.code).toBe(ErrorCodes.ACCOUNT_NOT_FOUND);
      expect(err.message).toMatch(/could not find/i);
    });
  });

  describe('fundAccount', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      jest.restoreAllMocks();
    });

    test('rejects non-testnet networks with INVALID_NETWORK', async () => {
      const { publicKey } = generateKeypair();

      await expect(fundAccount(publicKey, 'public')).rejects.toMatchObject({
        name: 'StellarUtilsError',
        code: ErrorCodes.INVALID_NETWORK,
        details: { network: 'public' },
      });
    });

    test('rejects invalid public keys before any HTTP call', async () => {
      const fetchMock = jest.fn();
      global.fetch = fetchMock;

      await expect(fundAccount('not-a-key')).rejects.toMatchObject({
        code: ErrorCodes.INVALID_ADDRESS,
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('calls Friendbot with the address and returns the parsed body', async () => {
      const { publicKey } = generateKeypair();
      const body = { hash: 'abc123', ledger: 42 };
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => body,
      });
      global.fetch = fetchMock;

      const result = await fundAccount(publicKey);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const calledUrl = fetchMock.mock.calls[0][0];
      expect(calledUrl).toBe(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );
      expect(result).toEqual(body);
    });

    test('maps non-ok responses to FRIENDBOT_ERROR', async () => {
      const { publicKey } = generateKeypair();
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 });

      await expect(fundAccount(publicKey)).rejects.toMatchObject({
        name: 'StellarUtilsError',
        code: ErrorCodes.FRIENDBOT_ERROR,
        details: { action: 'fundAccount', status: 400 },
      });
    });

    test('maps transport failures to FRIENDBOT_ERROR', async () => {
      const { publicKey } = generateKeypair();
      global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

      await expect(fundAccount(publicKey)).rejects.toMatchObject({
        code: ErrorCodes.FRIENDBOT_ERROR,
      });
    });
  });
});
