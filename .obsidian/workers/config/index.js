const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class Config {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  /**
   * Retrieves the value associated with the specified key from the configuration.
   *
   * @param {string} key - The key for which to retrieve the value.
   * @returns {*} The value associated with the specified key. Possible objects include:
   * - Configuration object
   * - Worker configuration
   * - API worker configuration
   * - ...
   */
  get(key) {
    const findKey = this.config[key];
    if (findKey) {
      return findKey;
    } else {
      return undefined;
    }
  }

  getConfigFile() {
    return path.join(process.cwd(), "obsidian.config.json");
  }

  /**
   * Get the default configuration for the application.
   *
   * @returns {Object} The default configuration object.
   * @property {string} name - The name of the application.
   * @property {number} port - The default port for the application.
   * @property {boolean} no_imports - Indicates whether imports are allowed.
   * @property {Object} workers - Configuration for worker processes.
   * @property {Object} workers.api - Configuration for the API worker.
   * @property {number} workers.api.port - The port for the API worker.
   * @property {string} workers.api.path - The path for the API worker.
   * @property {boolean} workers.api.enabled - Indicates if the API worker is enabled.
   * @property {boolean} workers.api.restricted - Indicates if the API worker is restricted.
   * @property {string} workers.api.secret - The secret key for the API worker.
   */
  getDefaultConfig() {
    const defaultPort = 3001; // Default port valu

    return {
      name: "An Obsidian App",
      mode: "dev",
      port: 3000,
      no_imports: false,
      view_engine: "html",
      db_port: 6379,
      github_webhook_secret: this.md5(this.rand()),
      auto_update: true,
      workers: {
        api: {
          port:
            this.config && this.config.workers && this.config.workers.api
              ? this.config.workers.api.port || defaultPort
              : defaultPort,
          path: "/api",
          enabled: true,
          restricted: false,
          secret: crypto.randomBytes(64).toString("hex"), // Include this line in the JSDoc
        },
      },
    };
  }

  md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
  }
  rand() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
  loadConfig() {
    const configFile = this.getConfigFile();
    if (!fs.existsSync(configFile)) {
      this.config = this.getDefaultConfig();
      fs.writeFileSync(configFile, JSON.stringify(this.config, null, 2));
    } else {
      const config = JSON.parse(fs.readFileSync(configFile));
      if (!config.port) {
        config.port = 3000;
      }
      if (!config.workers) {
        config.workers = this.getDefaultConfig().workers;
      }

      if (config.workers.api.restricted && !config.workers.api.secret) {
        config.workers.api.secret = crypto.randomBytes(64).toString("hex");
        console.log(
          "No secret key found in config file. Generating a new one."
        );
        console.log("Secret key: " + config.workers.api.secret);
      }
      this.config = config;
    }
  }
}

module.exports = {
  Config: Config,
};
