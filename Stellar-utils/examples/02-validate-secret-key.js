const { generateKeypair, validateSecretKey } = require('../src');

// Generate a fresh keypair and confirm the secret seed is structurally valid.
const { secretKey } = generateKeypair();

console.log(`Generated secret key: ${secretKey}`);
console.log(`Is the secret key valid? ${validateSecretKey(secretKey)}`);
