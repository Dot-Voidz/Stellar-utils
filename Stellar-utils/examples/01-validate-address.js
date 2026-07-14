const { generateKeypair, validateAddress } = require('../src');

// Generate a fresh keypair and verify the derived public key.
const { publicKey } = generateKeypair();

console.log(`Generated public key: ${publicKey}`);
console.log(`Is the public key valid? ${validateAddress(publicKey)}`);
