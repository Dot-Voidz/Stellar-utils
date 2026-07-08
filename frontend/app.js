document.getElementById('gen').addEventListener('click', async () => {
  const out = document.getElementById('out');
  out.textContent = 'Generating...';
  try {
    // Try to call backend endpoint if available
    const res = await fetch('/api/generate-keypair');
    if (res.ok) {
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
      return;
    }
  } catch (e) {
    // Fall back to client-side stub
  }
  out.textContent = JSON.stringify({ publicKey: 'G...', secretKey: 'S...' }, null, 2);
});
