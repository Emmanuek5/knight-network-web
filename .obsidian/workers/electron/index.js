const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const { exit } = require("process");
const fs = require("fs");
const crypto = require("crypto");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

class Electron {
  constructor(
    width = 800,
    height = 600,
    port,
    preload,
    dev = false,
    logger = console.log,
    options = {}
  ) {
    this.app = app;
    this.BrowserWindow = BrowserWindow;
    this.path = path;
    this.mainWindow = null;
    this.width = width;
    this.height = height;
    this.port = port;
    this.title = "";
    this.preload = preload;
    this.dev = dev;
    this.url = "";

    this.favicon = path.join(__dirname, "./public/favicon.ico");
    this.log = (text) => {
      logger(text);
    };
  }

  init() {
    app.whenReady().then(() => {
      this.mainWindow = new this.BrowserWindow({
        width: this.width,
        height: this.height,
        webPreferences: {
          preload: path.join(__dirname, this.preload),
          nodeIntegration: true,
          contextIsolation: true,
        },
      });

      //set the favicon
      this.mainWindow.setIcon(this.favicon);

      if (this.url) {
        this.mainWindow.loadURL(this.url);
      }

      if (this.title) {
        this.mainWindow.setTitle(this.title);
      }

      app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
          app.quit();
          exit(0);
        }
      });

      if (this.dev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    return this.mainWindow;
  }

  setMenu(menu) {
    return Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  }

  setIcon(favicon) {
    this.favicon = favicon;
  }
  setUrl(url) {
    this.url = url;
  }
  setTitle(title) {
    this.title = title;
  }
  /**
   * Load a file.
   *
   * @param {String} file - The file to be loaded.
   * @return {type} The result of loading the file.
   */
  loadFile(file) {
    return this.mainWindow.loadFile(file);
  }

  /**
   * Registers a callback function for the specified event.
   *
   * @param {string} event - The name of the event to listen for.
   * @param {Function} callback - The callback function to be executed when the event occurs.
   */
  on(event, callback) {
    ipcMain.on(event, callback);
  }

  send(event, data) {
    this.mainWindow.webContents.send(event, data);
  }

  newWindow(height, width) {
    return new this.BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }
}

module.exports = {
  Electron,
};
