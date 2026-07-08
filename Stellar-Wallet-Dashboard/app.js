document.getElementById('new').addEventListener('click', async () => {
  const out = document.getElementById('out');
  out.textContent = 'Generating...';
  try {
    const res = await fetch('/api/generate-keypair');
    if (res.ok) {
      out.textContent = JSON.stringify(await res.json(), null, 2);
      return;
    }
  } catch (e) {}
  out.textContent = JSON.stringify({ publicKey: 'G...', secretKey: 'S...' }, null, 2);
});
