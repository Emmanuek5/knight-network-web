const { App, Router, Server,Request, Response } = require("./application");
const bodyParser = require("body-parser");
const { Build } = require("./utils/builder");
// Create an express-like application
exports = module.exports = createApplication;

function createApplication() {
  
  const app = new App();
  return app;
}

// Expose the prototypes.
exports.Router = Router;
exports.raw = bodyParser.raw;
exports.static = require("serve-static");
exports.text = bodyParser.text;
exports.urlencoded = bodyParser.urlencoded;
exports.json = bodyParser.json;
exports.builder = Build;