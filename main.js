const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { scrapeGoogleMaps } = require('./scraper');
const { saveToCSV } = require('./utils/csv');
const { saveReport } = require('./utils/report');

let mainWindow;
let lastFiles = {};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(createWindow);

// Kirim log ke UI
function sendProgress(msg) {
  if (mainWindow) mainWindow.webContents.send('progress', msg);
}

// Jalankan scraper
  ipcMain.handle('start-scrape', async (_, { query, maxResults }) => {
  try {
    sendProgress(`🔍 Memulai scraping untuk: ${query}`);
    const data = await scrapeGoogleMaps(query, maxResults, sendProgress);

    const timestamp = Date.now();
    const safeQuery = query.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const base = `gmaps_${safeQuery}_${timestamp}`;

    // folder userData aman untuk menulis file
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });

    const jsonPath = path.join(userDataPath, `${base}.json`);
    const csvPath = path.join(userDataPath, `${base}.csv`);
    const reportPath = path.join(userDataPath, `${base}_report.txt`);

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    saveToCSV(data, csvPath);
    saveReport(query, data, reportPath);

    lastFiles = { jsonPath, csvPath, reportPath };
    sendProgress(`✅ Scraping selesai (${data.length} hasil).`);

    return { success: true, preview: data.slice(0, 3), count: data.length };
  } catch (err) {
    sendProgress(`❌ Error: ${err.message}`);
    return { success: false, error: err.message };
  }
});


// Simpan file manual
ipcMain.handle('save-file', async (_, { type }) => {
  if (!lastFiles[`${type}Path`]) return;
  const map = {
    json: { name: 'Hasil.json', path: lastFiles.jsonPath },
    csv: { name: 'Hasil.csv', path: lastFiles.csvPath },
    report: { name: 'Hasil_Report.txt', path: lastFiles.reportPath }
  };
  const { filePath } = await dialog.showSaveDialog({
    title: `Simpan ${type.toUpperCase()}`,
    defaultPath: map[type].name
  });
  if (filePath) {
    fs.copyFileSync(map[type].path, filePath);
    return { success: true, savedTo: filePath };
  }
  return { success: false };
});

ipcMain.handle('delete-temp-files', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const files = fs.readdirSync(userDataPath);
    const deleted = [];

    for (const file of files) {
      if (file.startsWith('gmaps_') && (file.endsWith('.json') || file.endsWith('.csv') || file.endsWith('.txt'))) {
        const filePath = path.join(userDataPath, file);
        fs.unlinkSync(filePath);
        deleted.push(file);
      }
    }

    if (deleted.length === 0) {
      return { success: false, message: 'Tidak ada file untuk dihapus.' };
    }

    lastFiles = {}; // reset lastFiles
    return { success: true, message: `${deleted.length} file dihapus.` };

  } catch (err) {
    return { success: false, message: err.message };
  }
});
