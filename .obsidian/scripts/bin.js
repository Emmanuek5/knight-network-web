#!/usr/bin/env node

class Colors {
  static GREEN_TEXT = "\x1b[32m";
  static WHITE_TEXT = "\x1b[37m";
  static MAGENTA_TEXT = "\x1b[35m";
  static RED_TEXT = "\x1b[31m";
  static BLUE_TEXT = "\x1b[34m";
  static YELLOW_TEXT = "\x1b[33m";
  static RESET = "\x1b[0m";

  static applyColor(message, color) {
    return color + message + Colors.RESET;
  }
}

const { execSync } = require("child_process");

const logger = (message, color = Colors.WHITE_TEXT) => {
  console.log(
    Colors.GREEN_TEXT +
      "[ENGINE INSTALLER] - " +
      Colors.applyColor(message, color)
  );
};

const logError = (error) => {
  console.error(
    Colors.RED_TEXT + "[APP ENGINE ERROR] - " + error.toString().trim(),
    Colors.RESET
  );
};

const runCommand = (command, description) => {
  logger(description);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.log(`Failed to run command: ${command}`);
    return false;
  }
  logger("Done.");
  return true;
};

const repoName = process.argv[2];
const gitCheckout = `git clone https://github.com/Emmanuek5/obsidian-engine.git --depth 1  ${repoName}`;
const installDeps = `cd ${repoName} && npm install`;
const startServer = `cd ${repoName} && npm start`;
const deleteGitFolder =
  process.platform === "win32"
    ? `rmdir /s /q ${repoName}\\.git`
    : `rm -rf ${repoName}/.git`;

const runDev = `cd ${repoName} && npm run install-dev`;

if (runCommand(gitCheckout, "Downloading Git repository...")) {
  if (runCommand(installDeps, "Installing dependencies...")) {
    if (runCommand(deleteGitFolder, "Deleting .git folder...")) {
      runCommand(runDev, "Running development script...");
    } else {
      logError("Failed to delete .git folder");
    }
    runCommand(startServer, "Starting the server...");
  } else {
    logError("Failed to install dependencies");
  }
} else {
  logError(
    "Failed to clone repo, Git is not installed or you are not connected to the internet"
  );
}
