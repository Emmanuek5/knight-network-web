const fs = require("fs");
const path = require("path");
const { RenderEngines } = require("../utils/Engines");
// lib/response.js
class Response {
  constructor(httpResponse) {
    this.response = httpResponse;
    this.statusCode = 200; // Default status code is 200 OK
    this.headers = {
      "Content-Type": "text/html",
      Engine: "Obsidian Engine",
      Engine_Version: require("../../../../../package.json").version,
      Engine_Author: require("../../../../../package.json").author,
      Engine_License: require("../../../../../package.json").license,
      Engine_Repo: require("../../../../../package.json").repository.url,
    };
    this.mainPath = process.cwd() + "/pages";
    this.rendered = false;
    this.renderedFile = "";
    this.viewEngine = "html";
    this.body = "";
  }

  setStatus(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  setCookie(name, value, options = {}) {
    const cookie = `${name}=${value}`;

    if (options.expires) {
      cookie += `; Expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge) {
      cookie += `; Max-Age=${options.maxAge}`;
    }

    if (options.domain) {
      cookie += `; Domain=${options.domain}`;
    }

    if (options.path) {
      cookie += `; Path=${options.path}`;
    }

    if (options.secure) {
      cookie += "; Secure";
    }

    if (options.httpOnly) {
      cookie += "; HttpOnly";
    }

    this.headers["Set-Cookie"] = this.headers["Set-Cookie"]
      ? `${this.headers["Set-Cookie"]}; ${cookie}`
      : cookie;
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  json(body) {
    this.setHeader("Content-Type", "application/json");
    this.body = JSON.stringify(body);
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }
  setHeader(header, value) {
    this.headers[header] = value;
    return this;
  }

  send(body) {
    this.body = body;
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }

  redirect(url) {
    this.response.writeHead(302, { Location: url });
    this.response.end();
    return this;
  }

  file(filePath) {
    if (fs.existsSync(filePath)) {
      this.body = fs.readFileSync(filePath);
      this.rendered = true;
      this.setHeader("Content-Type", "application/octet-stream"); // Set the appropriate content type based on the file type
      this.response.writeHead(this.statusCode, this.headers);
      this.response.end(this.body);
    } else {
      // Handle the case where the file does not exist
      this.setStatus(404).send("File not found");
    }
    return this;
  }

  json(body) {
    this.setHeader("Content-Type", "application/json");
    this.body = JSON.stringify(body);
    this.response.writeHead(this.statusCode, this.headers);
    this.response.end(this.body);
    return this;
  }

  render(file, options) {
    const viewEngine = this.viewEngine;
    if (viewEngine) {
      if (viewEngine == "html") {
        const renderEngine = new RenderEngines();
        const engine = renderEngine.getRenderer(this.viewEngine);
        this.body = engine(file, options);
        this.rendered = true;
        this.setHeader("Content-Type", "text/html");
        this.response.writeHead(this.statusCode, this.headers);
        this.response.end(this.body);
        return this;
      }
    } else {
      this.renderedFile = path.join(this.mainPath, file + ".html");
      this.rendered = true;
      this.setHeader("Content-Type", "text/html");
      this.body = fs.readFileSync(this.renderedFile, "utf8");
      this.response.writeHead(this.statusCode, this.headers);
      this.response.end(this.body);
      return this;
    }
  }
}

module.exports = {
  Response,
};
