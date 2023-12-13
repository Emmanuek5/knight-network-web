const path = require("path");
const { Build, COLORS } = require("../../modules");
const { execSync, spawn } = require("child_process");

const buildPath = path.join(process.cwd(), "dist");
const logger = (message) =>
  console.log(
    COLORS.GREEN_TEXT +
      "ENGINE LOGS - " +
      COLORS.applyColor(message, COLORS.BLUE_TEXT)
  );

logger("Starting Build Engine " + new Date().getTime());
let start = new Date().getTime();
const builder = new Build();
builder.buildAllPages();
builder.buildAllAssets();
builder.buildAllPublic();

let end = new Date().getTime();
logger("Build Completed in " + (end - start) + "ms");
