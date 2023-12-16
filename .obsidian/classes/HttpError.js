class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "HttpError";
  }
}

module.exports = HttpError;
