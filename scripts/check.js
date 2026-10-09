const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dirs = ['src', 'backend', 'frontend', 'examples'];

const files = dirs.flatMap((dir) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) {
    return [];
  }
  return fs
    .readdirSync(abs)
    .filter((name) => name.endsWith('.js'))
    .map((name) => path.join(dir, name));
});

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

console.log(`Syntax OK (${files.length} files).`);