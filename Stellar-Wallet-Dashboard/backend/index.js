const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Use the shared library where possible
let lib;
try {
  lib = require('../../src');
} catch (e) {
  lib = null;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/generate-keypair', (req, res) => {
  try {
    if (lib && lib.generateKeypair) return res.json(lib.generateKeypair());
    return res.json({ publicKey: 'GDEMO_DASH', secretKey: 'SDEMO_DASH' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(port, () => console.log(`Dashboard backend listening on ${port}`));
