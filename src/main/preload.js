const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('add', {
  create: () => ipcRenderer.send('add:create')
})