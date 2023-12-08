const { Electron, Config } = require("./.obsidian/workers/modules");
const path = require("path");

const config = new Config();
const port = config.get("port");
const electron = new Electron(
  2000,
  1000,
  port,
  "./pages/preload.js",
  false,
  console.log
);

const menu = [
  {
    label: "File",
    submenu: [
      {
        label: "Exit",
        click: () => {
          electron.mainWindow.close();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: () => {
          electron.mainWindow.reload();
        },
      },
      {
        label: "Back",
        accelerator: "CmdOrCtrl+Left",
        click: () => {
          electron.mainWindow.webContents.goBack();
        },
      },
      {
        label: "Toggle Developer Tools",
        accelerator:
          process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
        click: () => {
          electron.mainWindow.webContents.toggleDevTools();
        },
      },
      {
        label: "Toggle Full Screen",
        accelerator: "F11",
        click: () => {
          electron.mainWindow.setFullScreen(
            !electron.mainWindow.isFullScreen()
          );
        },
      },
    ],
  },
];
electron.setUrl("http://localhost:" + port);
electron.setMenu(menu);
electron.init();
electron.on("init-window", () => {
  console.log("Main window initialized");
});
