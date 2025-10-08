const output = document.getElementById('output');
const startBtn = document.getElementById('startBtn');
const saveButtons = document.getElementById('saveButtons');

startBtn.addEventListener('click', async () => {
  const query = document.getElementById('query').value;
  const maxResults = parseInt(document.getElementById('maxResults').value, 10);

  output.textContent = "⏳ Sedang Memproses...\n";
  saveButtons.style.display = 'none';

  const result = await window.electronAPI.startScrape(query, maxResults);

  if (result.success) {
    output.textContent += `\n✅ ${result.count} Hasil ditemukan.\n\  Hasil data pertama :\n${JSON.stringify(result.preview, null, 1)}`;
    saveButtons.style.display = 'block';
  } else {
    output.textContent += `\n❌ Gagal: ${result.error}`;
  }
});

// progress log
window.electronAPI.onProgress((msg) => {
  output.textContent += `\n${msg}`;
});

// tombol simpan
document.getElementById('saveJsonBtn').addEventListener('click', () => window.electronAPI.saveFile('json'));
document.getElementById('saveCsvBtn').addEventListener('click', () => window.electronAPI.saveFile('csv'));
document.getElementById('saveReportBtn').addEventListener('click', () => window.electronAPI.saveFile('report'));

document.getElementById('clearFilesBtn').addEventListener('click', async () => {
  const result = await window.electronAPI.deleteTempFiles();
  if (result.success) {
    output.textContent += `\n🗑️ File lokal berhasil dihapus.`;
    saveButtons.style.display = 'none';
  } else {
    output.textContent += `\n⚠️ Tidak ada file untuk dihapus.`;
  }
});

