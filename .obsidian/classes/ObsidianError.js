class ObsidianError extends Error {
  /**
   * Creates a new instance of the ObsidianError class.
   *
   * @param {any} ...args - The arguments passed to the constructor.
   * @return {void} - This constructor does not return a value.
   */
  constructor(...args) {
    super(...args);
    this.name = "ObsidianError";
  }
}

module.exports = ObsidianError;
