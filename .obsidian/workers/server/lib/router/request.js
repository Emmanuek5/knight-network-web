const url = require("url");
const querystring = require("querystring");
const fs = require("fs");
const { formidable } = require("formidable");
class Request {
  constructor(httpRequest) {
    this.method = httpRequest.method;
    this.path = httpRequest.url;
    this.headers = httpRequest.headers;
    this.httpRequest = httpRequest;
    this.body = "";
    this.params = {};
    this.files = {};
    this.cookies = {};
    this.session = {};
    this.user = null;
    this.file = this.files[0];
    this.ip = httpRequest.socket ? httpRequest.socket.remoteAddress : null;

    this.parseCookies();
  }

  chunkBody() {
    this.httpRequest.on("data", (chunk) => {
      this.body += chunk;
      this.parseBody();
    });
  }

  getBody() {
    return this.body;
  }

  async parseBody() {
    const contentType = this.headers["content-type"];

    if (contentType && contentType.includes("application/json")) {
      this.body = this.getBodyAsJSON();
    } else if (
      contentType &&
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      this.parseFormUrlEncoded();
    }
  }

  parseCookies() {
    const cookieHeader = this.headers && this.headers.cookie;
    if (cookieHeader) {
      this.cookies = querystring.parse(cookieHeader, "; ");
    }
  }
  parseFormUrlEncoded() {
    const formDataPairs = this.body.split("&");
    const formData = {};

    formDataPairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      const decodedKey = decodeURIComponent(
        key.replace(/\[object\s(.*)\]/, "")
      ).trim();
      const decodedValue = decodeURIComponent(value);
      formData[decodedKey] = decodedValue.trim();
    });
    this.body = formData;
    return formData;
  }

  // ...

  async parseFormData() {
    const form = formidable({ multiples: true });

    return new Promise((resolve, reject) => {
      form.parse(this.httpRequest, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          this.body = fields;
          // Format files array
          this.files = [];

          Object.keys(files).forEach((fieldName) => {
            const fieldFiles = files[fieldName];

            fieldFiles.forEach((file) => {
              this.files.push({
                name: file.originalFilename,
                temp: file.filepath,
                type: file.mimetype,
                size: file.size,
                mv: (path, callback) => {
                  // Move file to destination u= without fs.rename
                  fs.copyFile(file.filepath, path, (err) => {
                    if (err) {
                      callback(err);
                    } else {
                      callback();
                    }
                  });
                },
                // Add other properties as needed
              });
            });
          });

          resolve();
        }
      });
    });
  }

  getFilesFromRequest() {
    const files = [];
    const boundary = this.headers["content-type"].split("=")[1];
    const parts = this.body.split(boundary);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes("filename")) {
        const file = {};
        const fileDetails = parts[i].split("\r\n")[1];
        const fileData = parts[i].split("\r\n")[4];
        const fileName = fileDetails.split("=")[2].replace(/"/g, "");
        const fileType = fileDetails.split("=")[3].replace(/"/g, "");
        file.name = fileName;
        file.type = fileType;
        file.data = fileData;
        files.push(file);
      }
    }
    return files;
  }

  getBodyAsJSON() {
    return JSON.parse(this.body);
  }
}

module.exports = {
  Request,
};
