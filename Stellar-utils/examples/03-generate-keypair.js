const { generateKeypair } = require('../src');

// Create a fresh Stellar keypair that can be used for wallet or account setup.
const pair = generateKeypair();

console.log('New Stellar keypair');
console.log(`Public key : ${pair.publicKey}`);
console.log(`Secret key : ${pair.secretKey}`);
