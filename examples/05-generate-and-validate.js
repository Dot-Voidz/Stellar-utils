const { generateKeypair, validateAddress, validateSecretKey } = require('../src');

// Combine the core helpers in a single workflow: create a keypair and verify it.
const pair = generateKeypair();

console.log('Generated keypair');
console.log(`Public key : ${pair.publicKey}`);
console.log(`Secret key : ${pair.secretKey}`);
console.log(`Public key valid: ${validateAddress(pair.publicKey)}`);
console.log(`Secret key valid: ${validateSecretKey(pair.secretKey)}`);
