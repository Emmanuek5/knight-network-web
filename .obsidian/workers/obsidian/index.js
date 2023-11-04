#!/usr/bin/env node

const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const ps = require("ps-node"); // Import the ps-node package
const { COLORS } = require("./colours");
const builderpath = path.join(
  process.cwd(),
  ".obsidian/workers/builder/index.js"
);
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { Builder } = require(builderpath);

const args = process.argv.slice(2);
const mode_types = ["dev", "run", "build"];
const workingPath = process.cwd();

let nodeProcess = null;
let processExited = true;
let mode = "";

const logger = (message) =>
  console.log(
    COLORS.GREEN_TEXT +
      "ENGINE LOGS - " +
      COLORS.applyColor(message, COLORS.BLUE_TEXT)
  );
logger("Starting Obsidian Engine " + new Date().toISOString());

if (!args.length || !mode_types.includes(args[0])) {
  console.error(
    COLORS.applyColor("Usage: obsidian dev | start | build", COLORS.RED_TEXT)
  );
  process.exit(1);
}

mode = args[0];
args[0] = path.join(workingPath, ".obsidian/server/index.js");
if (!fs.existsSync(args[0])) {
  console.error(
    COLORS.applyColor("The Engine Was not installed correctly", COLORS.RED_TEXT)
  );
  process.exit(1);
}

const { Config } = require(path.join(
  workingPath,
  ".obsidian/workers/config/index.js"
));
const config = new Config();

async function stopNodeProcessByPort(port) {
  try {
    // Run netstat command to find processes using the specified port
    const { stdout } = await exec(
      `netstat -ano | find "LISTENING" | find "${port}"`
    );

    // Parse the output to get the process IDs
    const pids = stdout
      .split("\n")
      .map((line) => line.trim().split(/\s+/).pop())
      .filter((pid) => !isNaN(pid));

    // Stop each process using taskkill
    for (const pid of pids) {
      await exec(`taskkill /F /PID ${pid}`);
      logger(`Stopped process with PID ${pid} using port ${port}`);
    }
  } catch (error) {}
}
// Function to start the Node.js process
function startNodeProcess() {
  if (processExited) {
    processExited = false;
    nodeProcess = spawn("node", args, { shell: true });

    nodeProcess.stdout.on("data", (data) => {
      console.log(
        COLORS.GREEN_TEXT +
          "ENGINE LOGS - " +
          COLORS.applyColor(data.toString().trim(), COLORS.BLUE_TEXT)
      );
    });

    nodeProcess.stderr.on("data", (error) => {
      console.error(
        COLORS.RED_TEXT + "[ENGINE ERROR] - " + error.toString().trim(),
        COLORS.RESET
      );
    });

    nodeProcess.on("exit", function (code, signal) {
      nodeProcess = null;
      processExited = true;
      logger(COLORS.RED_TEXT + "ENGINE EXITED. Restarting...");
    });
  }
}

function stopCurrentNodeProcess() {
  if (nodeProcess) {
    const pid = nodeProcess.pid;
    logger(`Stopping current running process with PID ${pid}`);

    // Use SIGKILL for forceful termination
    process.kill(pid, "SIGKILL");

    nodeProcess = null;
    processExited = true;
  }
}

const watcher = chokidar.watch(workingPath, {
  //let it skip html and css files
  ignored: [/node_modules/, /.git/, /.obsidian/, /.*\.html$/, /.*\.css$/],
  persistent: true,
});

// Function to stop the current running Node.js process
// ...

watcher.on("ready", () => {
  watcher.on("all", (event, path) => {
    logger(`File changed ${path}`);
    logger("Clearing module cache from server");
    const start_time = new Date();
    stopCurrentNodeProcess(); // Stop the current running process
    stopNodeProcessByPort(config.config.db_port); // Stop the process by port
    stopNodeProcessByPort(config.config.port); // Stop the process by port
    logger(`Module cache cleared. Took: ${new Date() - start_time}ms`);
    startNodeProcess();
  });
});

// Function to stop a process by port

// Check for Obsidian Engine build
if (!fs.existsSync(path.join(workingPath, "obsidian.config.json"))) {
  console.error(
    COLORS.applyColor(
      "[ERROR] No Obsidian Engine build detected",
      COLORS.RED_TEXT
    )
  );
  console.log(
    COLORS.applyColor("Building The Application Now", COLORS.GREEN_TEXT)
  );
  const builder = new Builder();
  builder.build(() => {
    console.log(
      COLORS.applyColor(
        "Rerun The Application to get started",
        COLORS.CYAN_TEXT
      )
    );
  });
} else {
  // Start the Node.js process if build exists
  startNodeProcess();
}

module.exports = {
  mode,
};
