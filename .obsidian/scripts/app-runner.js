const path = require("path");
const fs = require("fs");
const workingDir = path.join(process.cwd(), "resources/app");
console.log(workingDir);
const workingDir_package_path = path.join(workingDir, "package.json");
const { spawn, execSync } = require("child_process");
const { COLORS } = require("obsidian-runner/colours");
const { exit } = require("process");
const workingDir_package = JSON.parse(
  fs.readFileSync(workingDir_package_path, "utf8")
);

let process_app = spawn("npm", ["run", "app"], {
  shell: true,
  cwd: workingDir,
});

process_app.stdout.on("data", (data) => {
  console.log(data.toString().trim());
});

process_app.stderr.on("data", (data) => {
  console.log(data.toString().trim());
});

process_app.on("error", function (error) {
  console.log(error);
});

process_app.on("exit", function (code, signal) {
  console.log("App process exited with code: " + code);
  process.kill(process.pid, "SIGTERM");
  exit(0);
});

process_app.on("close", function (code, signal) {
  console.log("App process closed with code: " + code);
  process.kill(process.pid, "SIGTERM");
  exit(0);
});
