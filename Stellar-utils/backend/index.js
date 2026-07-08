const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Import the library from src/ to power endpoints
const {
  validateAddress,
  validateSecretKey,
  generateKeypair,
  getBalance,
  createPaymentTransaction,
  submitTransaction
} = require('../src');

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/generate-keypair', (req, res) => {
  try {
    const keys = generateKeypair();
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/validate-address', (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address query required' });
  res.json({ valid: validateAddress(address) });
});

app.get('/api/validate-secret', (req, res) => {
  const { secret } = req.query;
  if (!secret) return res.status(400).json({ error: 'secret query required' });
  res.json({ valid: validateSecretKey(secret) });
});

app.get('/api/get-balance', async (req, res) => {
  const { address, network } = req.query;
  if (!address) return res.status(400).json({ error: 'address query required' });
  try {
    const balances = await getBalance(address, network || 'testnet');
    res.json({ balances });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/create-payment', async (req, res) => {
  const { sourceSecret, destination, amount, assetCode, assetIssuer, network } = req.body;
  if (!sourceSecret || !destination || !amount) return res.status(400).json({ error: 'sourceSecret, destination, amount required' });
  try {
    const xdr = await createPaymentTransaction(sourceSecret, destination, String(amount), assetCode || 'XLM', assetIssuer || null, network || 'testnet');
    res.json({ xdr });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/submit-transaction', async (req, res) => {
  const { xdr, network } = req.body;
  if (!xdr) return res.status(400).json({ error: 'xdr required' });
  try {
    const result = await submitTransaction(xdr, network || 'testnet');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(port, () => console.log(`Backend listening on ${port}`));
