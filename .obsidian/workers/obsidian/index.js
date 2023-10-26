#!/usr/bin/env node

const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const ps = require("ps-node"); // Import the ps-node package
const { COLORS } = require("./colours");

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

const { Builder } = require(path.join(
  workingPath,
  ".obsidian/workers/builder/index.js"
));
const { Config } = require(path.join(
  workingPath,
  ".obsidian/workers/config/index.js"
));
const config = new Config();
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
      startNodeProcess(); // Restart the Node.js process
    });
  }
}

const watcher = chokidar.watch(path.join(workingPath, "/pages"), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});

watcher.on("ready", () => {
  watcher.on("all", (event, path) => {
    logger("Clearing /pages/ module cache from server");
    Object.keys(require.cache).forEach((id) => {
      if (/[\/\\]pages[\/\\]/.test(id)) delete require.cache[id];
    });
    logger(`File changed ${path}`);
    stopNodeProcessByPort(config.get("port")); // Replace with the desired port to stop
    // No need to startNodeProcess here; it's automatically restarted in the 'exit' handler
  });
});



// Function to stop a process by port
function stopNodeProcessByPort(port) {
  ps.lookup(
    {
      command: "node",
      arguments: args,
    },
    (err, resultList) => {
      if (err) {
        throw new Error(err);
      }

      resultList.forEach((processInfo) => {
        if (processInfo.arguments.includes(`:${port}`)) {
          logger(`Stopping process with PID ${processInfo.pid}`);
          process.kill(processInfo.pid, "SIGTERM");
        }
      });
    }
  );
}

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
