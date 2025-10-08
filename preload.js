const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startScrape: (query, maxResults) => ipcRenderer.invoke('start-scrape', { query, maxResults }),
  saveFile: (type) => ipcRenderer.invoke('save-file', { type }),
  deleteTempFiles: () => ipcRenderer.invoke('delete-temp-files'),
  onProgress: (callback) => ipcRenderer.on('progress', (_, msg) => callback(msg))
});
