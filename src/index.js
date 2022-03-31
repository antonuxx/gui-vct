/***********************************************************************************************//**
 *  Require electron from node_modules to manage the windows of the application.
 *  @file       Index.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/* {app}            Module to control application life. */
/* {BrowserWindow}  Module to create native browser window. */
const {app, BrowserWindow} = require('electron')

/* Keep a global reference of the window object, if you don't, the window will */
/* be closed automatically when the JavaScript object is garbage collected. */
var mainWindow = null;

/* Quit when all windows are closed. */
app.on('window-all-closed', function() {
    /* On OS X it is common for applications and their menu bar */
    /* to stay active until the user quits explicitly with Cmd + Q */
    if (process.platform != 'darwin') {
        app.quit();
    }
});

/* initialization and is ready to create browser windows. */
app.on('ready', function() {
    /* Create the browser window. */
    mainWindow = new BrowserWindow({
        title: 'VCT',
        width: 950,
        height: 600,
        minWidth: 1055,
        minHeight: 710,
        webPreferences:
        {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    /* and load the index.html of the app. */
    mainWindow.loadFile('index.html');
    mainWindow.removeMenu();
    /* Open the DevTools. */
    mainWindow.openDevTools();
    if (process.env.NODE_ENV === "test") {
        mainWindow.webContents.closeDevTools();
    }

    /* Emitted when the window is closed. */
    mainWindow.on('closed', function() {
        /* Dereference the window object */
    mainWindow = null;
    });
});
