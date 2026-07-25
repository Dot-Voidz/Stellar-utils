const {
  validateAddress,
  validateSecretKey,
  validateAmount,
  generateKeypair,
  getBalance,
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
});
