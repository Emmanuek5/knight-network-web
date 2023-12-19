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
      this.body = this.toJSON();
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
          this.body = {};
          this.files = {};

          Object.keys(files).forEach((fieldName) => {
            const fieldFiles = files[fieldName];
            const firstFile = fieldFiles[0];

            this.files[fieldName] = {
              name: firstFile.originalFilename,
              temp: firstFile.filepath,
              type: firstFile.mimetype,
              size: firstFile.size,
              mv: (path, callback) => {
                fs.copyFile(firstFile.filepath, path, (err) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback();
                  }
                });
              },
              // Add other properties as needed
            };
          });

          Object.keys(fields).forEach((fieldName) => {
            if (Array.isArray(fields[fieldName])) {
              // If it's an array, use the first item
              this.body[fieldName] = fields[fieldName][0];
            } else {
              // If it's not an array, use it directly
              this.body[fieldName] = fields[fieldName];
            }
          });

          // Use the dynamic field name for files
          const dynamicFieldName = Object.keys(this.files)[0];
          this.file = this.files[dynamicFieldName];

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

  toJSON() {
    try {
      return JSON.parse(this.body);
    } catch (error) {}
  }
}

module.exports = {
  Request,
};
