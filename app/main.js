const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

// SET ENV

process.env.NODE_ENV = 'production'

// Mantenha uma referencia global do objeto da janela, se você não fizer isso, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado.
let win
let addWindow

function createMainWindow() {
  // Criar uma janela de navegação.
  win = new BrowserWindow({title: 'Deck Prices'})

  // e carrega index.html do app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitido quando a janela é fechada.
  win.on('closed', () => {
    // Elimina a referência do objeto da janela, geralmente você iria armazenar as janelas
    // em um array, se seu app suporta várias janelas, este é o momento
    // quando você deve excluir o elemento correspondente.
    win = null
    if (addWindow != null) {
      addWindow.close()
    }
  })

  // criar menu do template

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

  Menu.setApplicationMenu(mainMenu)
}

// cria nova janela para adicionar decks
function createAddWindow() {
  // Criar uma janela de navegação.
  addWindow = new BrowserWindow({
    width: 200,
    height: 400,
    title: 'Add Deck'
  })

  // e carrega index.html do app.
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addDeck.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Lidando com coleta de licho
  addWindow.on('close', function () {
    addWindow = null
  })
}

// Catch deck:add
ipcMain.on('deck:add', function (e, items) {
  win.webContents.send('deck:add', items)
  addWindow.close()
})

ipcMain.on('deck:addWindow', function () {
  if (addWindow == null) {
    createAddWindow()
  }
})

// Este método será chamado quando o Electron tiver finalizado
// a inicialização e está pronto para criar a janela browser.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.on('ready', createMainWindow)

// Finaliza quando todas as janelas estiverem fechadas.
app.on('window-all-closed', () => {
  // No macOS é comum para aplicativos e sua barra de menu
  // permaneçam ativo até que o usuário explicitamente encerre com Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createMainWindow()
  }
})

// create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Deck',
        accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
        click() {
          if (addWindow == null) {
            createAddWindow()
          }
        }
      },
      {
        label: 'Clear Deck',
        accelerator: process.platform === 'darwin' ? 'Command+K' : 'Ctrl+K',
        click() {
          win.webContents.send('deck:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
      {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
      {type: 'separator'},
      {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
      {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
      {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
      {label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'}
    ]
  }
]

// Se estiver no mac, adiciona um menu sem nome com um Quit e retira o quit do File
if (process.platform === 'darwin') {
  mainMenuTemplate[0]['submenu'].pop(1)
  mainMenuTemplate.unshift({
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit()
        }
      }]
  })
}

if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
