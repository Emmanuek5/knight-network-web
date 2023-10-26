const { Request } = require("./request");
const { Response } = require("./response");

// components/router.js
class Router {
  constructor() {
    this.routes = {};
    this.basePath = "";
  }

  addRoute(path, method, handler) {
    // Initialize this.routes[path] as an empty object if it doesn't exist
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = handler;
  }

  /**
   * Add a new route for handling GET requests.
   *
   * @param {string} path - The URL path of the route.
   * @param {function} handler - The function that handles the request.
   * @param {Request} handler.req - The request object.
   * @param {Response} handler.res - The response object.
   * @access public
   * @return {undefined} This function does not return anything.
   */
  get(path, handler) {
    this.addRoute(path, "GET", handler);
  }

  /**
   * Adds a new route for handling POST requests.
   *
   * @param {string} path - The path of the route.
   * @param {function} handler - The handler function for the route.
   */
  post(path, handler) {
    this.addRoute(path, "POST", handler);
  }

  /**
   * Add a new route for handling PUT requests.
   *
   * @param {string} path - the path of the route
   * @param {function} handler - the handler function for the route
   * @return {undefined}
   */
  put(path, handler) {
    this.addRoute(path, "PUT", handler);
  }

  /**
   * Deletes
   *
   * @param {string} path - The path of the route to be deleted.
   * @param {function} handler - The handler function to be executed when the route is deleted.
   * @return {undefined} - This function does not return a value.
   */
  delete(path, handler) {
    this.addRoute(path, "DELETE", handler);
  }

  /*
   * Patches a route with the specified path and handler.
   *
   * @param {string} path - The path of the route to patch.
   * @param {function} handler - The handler function to be executed when the route is called.
   */
  patch(path, handler) {
    this.addRoute(path, "PATCH", handler);
  }

  /**
   * Adds a route for the HEAD HTTP method.
   *
   * @param {string} path - The path of the route.
   * @param {function} handler - The handler function to be executed for the route.
   */
  head(path, handler) {
    this.addRoute(path, "HEAD", handler);
  }

  /**
   * Updates the specified path with the provided handler.
   *
   * @param {string} path - The path to update.
   * @param {function} handler - The handler function to associate with the path.
   * @return {undefined} - This function does not return a value.
   */
  update(path, handler) {
    this.addRoute(path, "UPDATE", handler);
  }
}

module.exports = {
  Router,
};
