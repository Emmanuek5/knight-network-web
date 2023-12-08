const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { COLORS } = require("../workers");

const workingPath = process.cwd();
const working_json = fs.readFileSync(path.join(workingPath, "package.json"));
const workingNodeModules = path.join(workingPath, "node_modules");
const electronDir = path.join(workingPath, ".obsidian/workers/electron");
const runnerDir = path.join(workingPath, ".obsidian/workers/obsidian");
const runnerPackageJson = fs.readFileSync(path.join(runnerDir, "package.json"));
const electronPackageJson = fs.readFileSync(
  path.join(electronDir, "package.json")
);
const electronNodeModules = path.join(electronDir, "node_modules");
const runnerNodeModules = path.join(runnerDir, "node_modules");

const logger = (message, color = COLORS.GREEN_TEXT) => {
  console.log(
    COLORS.YELLOW_TEXT + // Change to your preferred color
      "[PACKAGE INSTALLER] - " +
      COLORS.applyColor(message, color)
  );
};

const logError = (error) => {
  console.error(
    COLORS.RED_TEXT + "[PACKAGE INSTALLER ERROR] - " + error.toString().trim(),
    COLORS.RESET
  );
};

function installPackages(directory, packageJson) {
  logger(`Installing required packages in ${directory}...`);
  try {
    execSync("npm install", { cwd: directory, stdio: "ignore" });
    logger("Packages installed successfully!", COLORS.BLUE_TEXT);
  } catch (error) {
    logError("Error installing packages:");
    logError(error);
    process.exit(1); // Exit the script on critical error
  }
}

function installPackagesInWorkingPath(packageJson, nodeModulesPath) {
  logger(`Installing required packages in the working path...`);
  try {
    execSync("npm install", { cwd: nodeModulesPath, stdio: "ignore" });
    logger(
      "Packages installed successfully in the working path!",
      COLORS.BLUE_TEXT
    );
  } catch (error) {
    logError("Error installing packages in the working path:");
    logError(error);
    process.exit(1); // Exit the script on critical error
  }
}

installPackagesInWorkingPath(workingPath);
installPackages(electronDir, electronPackageJson);
installPackages(runnerDir, runnerPackageJson);
