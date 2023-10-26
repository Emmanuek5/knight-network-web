const { Config } = require("../config/index.js");
const { COLORS } = require("../obsidian/colours.js");
class Builder {
  constructor() {
    this.config = new Config();
    this.logger = (message) =>
      console.log(
        COLORS.applyColor(`[BUILD LOGS] ${message}`, COLORS.GREEN_TEXT)
      );
  }

  /**
   * Builds the application.
   *
   * @returns {Promise} A promise that resolves when the application has been built.
   * @async
   * @public
   *
   *
   * @example
   * const builder = new Builder();
   * builder.build();
   *
   */
  async build() {
    this.logger("Loading configuration...");
    this.config.loadConfig();
    this.logger(COLORS.YELLOW_TEXT + "BUILD COMPLETE");
  }
}

module.exports = {
  Builder,
};
