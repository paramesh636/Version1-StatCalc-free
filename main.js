const { app, BrowserWindow } = require('electron');
const { Menu } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 600
    });

    Menu.setApplicationMenu(null);

    win.loadFile('main.html');
}

app.whenReady().then(() => {
    createWindow();
});
