const { app, BrowserWindow, Menu, MenuItem} = require('electron')

let win

function createWindow() {
  let indexPageURL = `file://${__dirname}/public/index.html`;
  let windowConfig = {
    width: 1280,
    height: 720,
    icon: __dirname + '/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      webSecurity: false,
    }
  };

  const menuTemplate = [
  {
    label: 'Electron',
    submenu: [
      {role: 'quit'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  }];

  if (process.argv.includes('--dev')) {
    indexPageURL = `http://localhost:8089/index.html`;
    menuTemplate.push({
      label: 'Development',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'}
      ]
    });
  }


  win = new BrowserWindow(windowConfig);
  win.loadURL(indexPageURL);

  const applicationMenu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(applicationMenu)

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.disableHardwareAcceleration()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
