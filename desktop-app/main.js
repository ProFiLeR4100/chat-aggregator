const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
let ipc = require('electron').ipcMain;
let win;
let fEServer;

function createWindow () {
    win = new BrowserWindow({width: 800, height: 600, frame: false});

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.openDevTools();

    fEServer = spawn('node', ['start-server']);

    win.on('closed', () => {
        win = null;

        if (fEServer) {
            fEServer.kill();
        }
    });
}

ipc.on('server', (event, arg) => {
    console.log(arg);
    if (arg === 'start') {

        fEServer = spawn('node', ['start-server']);

        fEServer.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        fEServer.stderr.on('data', (data) => {
            console.error(data.toString());
        });
    } else if (fEServer) {
        fEServer.kill();
    }
    event.returnValue = arg === 'start' ? 'pause' : 'play';
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});