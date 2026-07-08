const http = require('http');
const path = require('path');

const libraryPath = path.join(__dirname, '..', '..', 'src');

function fetchKeypairFromBackend() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:4000/api/generate-keypair', res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Backend request failed: ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    const utils = require(libraryPath);
    const keypair = utils.generateKeypair();
    console.log('Generated keypair from shared library:');
    console.log(JSON.stringify(keypair, null, 2));
    return;
  } catch (err) {
    console.warn('Unable to load shared library:', err.message);
  }

  console.log('Falling back to backend endpoint...');
  try {
    const result = await fetchKeypairFromBackend();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error fetching keypair from backend:', err.message);
    process.exit(1);
  }
}

main();
