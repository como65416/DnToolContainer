const { app, BrowserWindow } = require('electron')

let win

function createWindow() {
  win = new BrowserWindow({ width: 1280, height: 720 })

  const indexPageURL = `file://${__dirname}/index.html`;
  win.loadURL(indexPageURL);

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
