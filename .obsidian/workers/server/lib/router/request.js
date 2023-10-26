const url = require("url");
const querystring = require("querystring");

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
    this.ip = httpRequest.socket ? httpRequest.socket.remoteAddress : null;

    // Listen for data events to collect request body
    httpRequest.on("data", (chunk) => {
      this.body += chunk.toString();
      this.parseBody();
    });

    this.parseCookies();
  }

  getBody() {
    return this.body;
  }

  async parseBody() {
    const contentType = this.headers["content-type"];

    if (contentType && contentType.includes("application/json")) {
      this.body = this.getBodyAsJSON();
    } else if (contentType && contentType.includes("multipart/form-data")) {
      this.parseFormData();
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

  parseFormData() {
    const boundary = this.headers["content-type"].split("=")[1];
    const parts = this.body.split(`--${boundary}`);

    const formData = {};
    const files = {};

    // Iterate through parts, excluding the last (empty) part
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i].trim();

      if (!part.includes("filename") && !part.includes("Content-Disposition")) {
        // Skip if it's not a valid part
        continue;
      }

      // Check if it's a field or a file
      if (part.includes("filename")) {
        const file = {};
        const lines = part.split("\r\n");

        // Extract file details
        const fileDetails = lines[1];
        const fileNameMatch = fileDetails.match(/filename="(.*)"/);
        const fileName = fileNameMatch ? fileNameMatch[1] : undefined;

        if (!fileName) {
          // Skip if filename is not found
          continue;
        }

        const fileTypeMatch = fileDetails.match(/Content-Type: (.*)/);
        const fileType = fileTypeMatch ? fileTypeMatch[1] : undefined;

        file.name = fileName;
        file.type = fileType;

        // Check if file data is base64 encoded
        const isBase64 =
          lines[2] && lines[2].includes("Content-Transfer-Encoding: base64");

        // Extract file data
        const fileDataLines = isBase64
          ? lines.slice(4, -1)
          : lines.slice(3, -1);
        const fileData = isBase64
          ? fileDataLines.join("")
          : fileDataLines.join("\r\n");
        file.data = isBase64 ? Buffer.from(fileData, "base64") : fileData;
        // Add file to files object
        files[fileName] = file;
      } else {
        // It's a regular form field
        const [header, value] = part.split("\r\n\r\n");
        const fieldNameMatch = header.match(/name="(.*)"/);
        const fieldName = fieldNameMatch ? fieldNameMatch[1] : undefined;

        if (!fieldName) {
          // Skip if field name is not found
          continue;
        }

        formData[fieldName] = value;
      }
    }

    // Assign parsed form data and files to the respective properties
    this.body = formData;
    this.files = files;

    return { formData, files };
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
    try {
      return JSON.parse(this.body);
    } catch (error) {
      return null;
    }
  }
}

module.exports = {
  Request,
};
