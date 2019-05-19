const { app, BrowserWindow, Menu, MenuItem} = require('electron')

let win

function createWindow() {
  let indexPageURL = `file://${__dirname}/public/index.html`;
  let windowConfig = {
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webviewTag: true
    },
    icon: __dirname + '/icon.png'
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
    windowConfig.webPreferences.webSecurity = false,
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
