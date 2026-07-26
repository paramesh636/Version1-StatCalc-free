const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    exportToPDF: (filename) => ipcRenderer.invoke('export-to-pdf', filename)
});