const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('add', {
  create: () => ipcRenderer.send('add:create'),
  onCards: (callback) => ipcRenderer.on("main:cards", callback)
})