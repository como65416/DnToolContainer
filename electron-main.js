const { app, BrowserWindow, Menu, MenuItem} = require('electron')

let win

function createWindow() {
  win = new BrowserWindow({ width: 1280, height: 720, icon: 'icon.png' })

  const indexPageURL = `file://${__dirname}/index.html`;
  win.loadURL(indexPageURL);

  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Help', submenu: [
        {
          role: 'toggledevtools'
        }
      ]
    }
  ));

  win.setMenu(menu);

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
