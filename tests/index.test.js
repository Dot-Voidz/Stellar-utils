const { validateAddress, validateSecretKey, generateKeypair } = require('../src/index');

describe('Stellar Utils', () => {
  describe('validateAddress', () => {
    test('should return true for valid address', () => {
      const validAddress = 'GCEE62D47LJ5VPSM35K5N6UHPJ3S37VZ55ZJ35X2WVW2O2XK347L4QJK';
      expect(validateAddress(validAddress)).toBe(true);
    });

    test('should return false for invalid address', () => {
      expect(validateAddress('invalid')).toBe(false);
      expect(validateAddress('')).toBe(false);
      expect(validateAddress(null)).toBe(false);
    });
  });

  describe('validateSecretKey', () => {
    test('should return true for valid secret key', () => {
      const validSecret = 'SBKWBJLJ4XH3OZ2J6PXJ36Z34XK5WVW2O2XK347L4QJKCEE62D47LJ5VPSM3';
      expect(validateSecretKey(validSecret)).toBe(true);
    });

    test('should return false for invalid secret key', () => {
      expect(validateSecretKey('invalid')).toBe(false);
      expect(validateSecretKey('')).toBe(false);
      expect(validateSecretKey(null)).toBe(false);
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
});
