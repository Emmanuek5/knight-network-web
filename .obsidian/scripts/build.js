const {Build, COLORS} = require("../../modules")

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
builder.buildALLStyles();
builder.buildAllScripts();
let end = new Date().getTime();
logger("Build Completed in " + (end - start) + "ms");