const { app, BrowserWindow, Menu, MenuItem} = require('electron')

let win

function createWindow() {
  win = new BrowserWindow({ width: 1280, height: 720, icon: 'icon.png' })

  const indexPageURL = `file://${__dirname}/index.html`;
  win.loadURL(indexPageURL);

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
  },
  {
    label: 'Help',
    submenu: [
      {role: 'toggledevtools'}
    ]
  }];

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
