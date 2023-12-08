const workingDir = process.cwd();
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { COLORS } = require("obsidian-runner/colours");
const workingDir_package_path = path.join(workingDir, "package.json");
const workingDir_package = JSON.parse(
  fs.readFileSync(workingDir_package_path, "utf8")
);
const main = workingDir_package.main;

// Modify the package.json content
workingDir_package.main = ".obsidian/scripts/app-runner.js";
fs.writeFileSync(workingDir_package_path, JSON.stringify(workingDir_package));

const logger = (message, color = COLORS.BLUE_TEXT) => {
  console.log(
    COLORS.YELLOW_TEXT +
      "[APP PACKAGER LOGS] - " +
      COLORS.applyColor(message, color)
  );
};

// Spawn npm process
const npmProcess = spawn("npm", ["run", "app:packager"], {
  cwd: workingDir,
  shell: true,
});

npmProcess.stdout.on("data", (data) => {
  logger(data.toString().trim());
});

npmProcess.stderr.on("data", (data) => {
  logger(data.toString().trim());
});

npmProcess.on("error", function (error) {
  logger(error);
});

npmProcess.on("exit", function (code, signal) {
  logger("App process exited with code: " + code);

  // Revert changes to package.json after npm process exits
  workingDir_package.main = main;
  fs.writeFileSync(workingDir_package_path, JSON.stringify(workingDir_package));
});

npmProcess.on("close", function (code, signal) {
  logger("App process closed with code: " + code);
  workingDir_package.main = main;
  fs.writeFileSync(workingDir_package_path, JSON.stringify(workingDir_package));
});
