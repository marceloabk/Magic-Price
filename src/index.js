const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const { getCardFrom } = require('./lmLikeScrapper.js');
const path = require('path');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('--no-sandbox');
app.disableHardwareAcceleration();

let mainWindow
let addWindow

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './main/preload.js')
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './main/index.html'));
};

const handleCreateAddWindows = () => {
  addWindow = new BrowserWindow({
    width: 200,
    height: 400,
    title: "Add Deck",
    webPreferences: {
      preload: path.join(__dirname, './add/preload.js')
    },
    parent: mainWindow
  })

  addWindow.loadFile(path.join(__dirname, './add/index.html'))
}

const handleAddCards = async (_, list) => {
  closeAddWindow()

  let items = list.split("\n");

  items = items.filter((n) => {
    return n && n[0] !== n[1] && n[0] !== "/";
  });

  let deckData = [];
  for (let i = 0; i < items.length; i++) {
    let j = 0;
    for (j = 0; j < items[i].length; j++) {
      if (isNaN(items[i][j])) {
        break;
      }
    }
    j--;
    let cardData = {};
    cardData.quantity = items[i].substring(0, j);
    if (!cardData.quantity) cardData.quantity = 1;
    cardData.name = items[i].substring(j + 1, items[i].length - j + 1);
    deckData.push(cardData);
  }

  await Promise.all([
    ...deckData.map((card) => {
      return getCardFrom(card.name, "asgardstore").then((res) => {
        console.log({ res })
        mainWindow.send("main:cards", {items: [res], card})
      })
    })
  ])
}

const closeAddWindow = () => {
  addWindow.close()
  addWindow = null
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('add:create', handleCreateAddWindows)
  ipcMain.on('add:cards', handleAddCards)
  createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
