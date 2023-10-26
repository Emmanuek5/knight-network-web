const { Config } = require("../../config");
const { Request } = require("./router/request");
const { Response } = require("./router/response");
const { Router } = require("./router/router");
const { Server } = require("./router/server");
const { METHODS } = require("./utils/constants");
const { View } = require("./utils/view");

class App {
  constructor() {
    this.config = new Config()
     this.server = new Server(this.config.get("view_engine"));
    this.cache = {};
    this.engines = {};
    this.locals = Object.create(null);
    this.mountpath = "/";
    this.set("view engine", "html"); // Set the default view engine
    this.set("views", "views"); // Set the default views directory
    this.req = new Request(this.server.getHttpServer());
    this.res = new Response(this.server.getHttpServer());
  }

  /**
   * Listens for incoming requests on the specified port.
   *
   * @param {number} port - The port number to listen on. If not provided, defaults to 3000.
   * @param {function} cb - The callback function to be called when the server is listening.
   * @return {void}
   */
  listen(port, cb) {
    this.server.listen(port || 3000, cb);
  }

  /**
   * A function that adds middleware to the application.
   *
   * @param {string} file - The file or module to use as middleware.
   * @param {string} basePath - The base path for the middleware.
   */
  use(basePath,file) {
    this.server.use(file, basePath);
  }

  dir(path, httpPath) {
    this.server.dir(path, httpPath);
  }

  // Define a function to set and get application settings
  set(setting, val) {
    if (arguments.length === 1) {
      return this.cache[setting];
    }
    this.cache[setting] = val;
    return this;
  }

  addRoute(path, method, handler) {
    this.server.addRoute(path, method, handler);
  }

  // Define a function to get application settings
  get(setting) {
    return this.cache[setting];
  }

  post (path, handler) {
    this.server.addRoute(path, "POST", handler);
  }

  /**
   * Adds a GET route to the server.
   *
   * @param {string} path - The path of the route.
   * @param {function} handler - The handler function for the route.
   * @param {Request} handler.req - The request object.
   * @param {Response} handler.res - The response object.
   * @access public
   * @return {undefined} This function does not return anything.
   * 
   */
  get (path, handler) {
    this.server.addRoute(path, "GET", handler);
  }

  put (path, handler) {
    this.server.addRoute(path, "PUT", handler);
  }

  delete (path, handler) {
    this.server.addRoute(path, "DELETE", handler);
  }

  patch (path, handler) {
    this.server.addRoute(path, "PATCH", handler);
  }

  head (path, handler) {
    this.server.addRoute(path, "HEAD", handler);
  }

  update (path, handler) {
    this.server.addRoute(path, "UPDATE", handler);
  }


  // Define a function to set application settings
  enable(setting) {
    return this.set(setting, true);
  }

  // Define a function to set application settings
  disable(setting) {
    return this.set(setting, false);
  }

  // Define a function to check if a setting is enabled
  enabled(setting) {
    return Boolean(this.set(setting));
  }

  // Define a function to check if a setting is disabled
  disabled(setting) {
    return !this.set(setting);
  }

  // Define a function to set application settings

  // Define a function to set application settings
  set(setting, val) {
    if (arguments.length === 1) {
      return this.cache[setting];
    }
    this.cache[setting] = val;
    return this;
  }

  // Define a function to get application settings

  engine(name,fn){
    if (!fn && typeof name === "function") {
      fn = name;
      name = "html";
    }
    if (typeof fn !== "function") {
      throw new Error("callback function required");
    }

    // get file extension
    const ext = name[0] !== "." ? "." + name : name;

    // store engine
     this.engines[name] = {
       renderer : fn,
       ext: ext
     }
     console.log("Engine Registered");
     console.log(this.engines[name]);
  }

  /**
   * Renders a view with the given name and options.
   *
   * @param {string} name - The name of the view to render.
   * @param {object} options - The options to be passed to the view.
   * @param {function} callback - The callback function to be invoked after rendering.
   * @return {undefined} This function does not return a value.
   */
  render(name, options, callback) {
    // Set the default view engine from app settings
    const defaultViewEngine = this.get("view engine") || "html";

    // Set the default views directory from app settings
    const viewsDirectory = this.get("views") || "views";

    // Create a new View instance with the provided name and options
    const view = new View(name, {
      root: viewsDirectory,
      ext: `.${defaultViewEngine}`,
      engines: this.engines,
    });

    // Render the view using the View class
    view.render(options, callback);
  }
}

module.exports = {
  App,
  Router,
  Request,
  Response,
  Server,
  METHODS,
  View,
}
