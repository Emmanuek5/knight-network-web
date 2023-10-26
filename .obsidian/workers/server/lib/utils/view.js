const fs = require("fs");
const path = require("path");

class View {
  constructor(name, options) {
    var opts = options || {};
    this.root = opts.root || "views"; // Default root directory is "views"
    this.ext = opts.ext || ".html"; // Default extension is ".html"
    this.name = name;
  }

  render(options, callback) {
    const filePath = path.join(this.root, this.name + this.ext);

    // Read the content of the view file
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return callback(err);
      }

      // Use the rendering engine from options or a default function
      const renderer = options.renderer || defaultRenderer;
      const renderedContent = renderer(data, options);

      callback(null, renderedContent);
    });
  }
}

// Default rendering function (replace with your rendering logic)
function defaultRenderer(content, options) {
    return content;
}

module.exports = {
  View,
};
