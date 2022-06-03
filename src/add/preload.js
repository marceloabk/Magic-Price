const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('add', {
  cards: (list) => ipcRenderer.send('add:cards',list)
})