const fs = require("fs");
const path = require("path");
const { RenderEngines } = require("./Engines"); // Adjust the import path as needed

class Build {
  constructor() {
    this.sourceDir = process.cwd() + "/pages"; // Set your source directory
    this.distDir = process.cwd() + "/dist"; // Set your destination (dist) directory
    this.scriptsDir = process.cwd() + "/public/js"; // Set your scripts directory
    this.stylesDir = process.cwd() + "/public/css"; // Set your styles directory
    this.assetsDir = process.cwd() + "/assets"; // Set your assets directory
    this.pagesdistDir = process.cwd() + "/dist/"; // Set your destination (dist) directory
    this.publicDir = process.cwd() + "/public";

    this.renderEngines = new RenderEngines();
  }

  buildAllPages() {
    // Create the dist folder if it does not exist
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
    if (!fs.existsSync(this.pagesdistDir)) {
      fs.mkdirSync(this.pagesdistDir, { recursive: true });
    }
    // Build all pages
    this.buildPages(this.sourceDir, this.distDir);
  }

  buildPages(sourcePath, distPath) {
    const items = fs.readdirSync(sourcePath);
    items.forEach((item) => {
      const sourceItemPath = path.join(sourcePath, item);
      let distItemPath = path.join(distPath, item);
      const stats = fs.statSync(sourceItemPath);

      if (stats.isDirectory()) {
        // Recursively build pages in subdirectories with the correct dist folder
        this.buildPages(sourceItemPath, distItemPath);
      } else if (stats.isFile() && path.extname(item) === ".html") {
        // If it's an HTML file, change the file extension to ".ejs"
        const newDistItemPath = distItemPath;
        // Create a folder structure in the dist directory based on the source folder
        const relativePath = path.relative(this.sourceDir, sourceItemPath);
        const folderPath = path.dirname(relativePath);

        // Adjust the distItemPath to include the correct folder structure
        distItemPath = path.join(
          this.pagesdistDir,
          folderPath,
          path.basename(newDistItemPath)
        );

        // Render and build the page with the new file extension
        this.renderPage(sourceItemPath, distItemPath);
      }
    });
  }

  renderPage(sourceFilePath, distFilePath) {
    const relativePath = path.relative(this.sourceDir, sourceFilePath);
    const folderPath = path.dirname(relativePath); // Get the folder path

    // Create the folder structure in the dist directory if it doesn't exist
    const distFolder = path.join(this.pagesdistDir, folderPath);
    if (!fs.existsSync(distFolder)) {
      fs.mkdirSync(distFolder, { recursive: true });
    }

    // Remove the file extension from the file name
    let fileName = path.basename(relativePath, path.extname(relativePath));

    // If the folder path is not empty, prepend it to the file name
    if (folderPath !== "") {
      fileName = path.join(folderPath, fileName);
    }

    console.log(fileName);

    const content = this.renderEngines.htmlRenderer(fileName, {}, "build");
    fs.writeFileSync(distFilePath, content);
  }

  buildAllAssets() {
    this.copyFolder(this.assetsDir, path.join(this.distDir, "assets"));
  }

  buildAllPublic() {
    this.copyFolder(this.scriptsDir, path.join(this.distDir, "scripts"));
    this.copyFolder(this.stylesDir, path.join(this.distDir, "styles"));
  }

  setUpNewServer() {
    const default_server_code = fs.readFileSync(
      path.join(__dirname, "default_express.js"),
      "utf-8"
    );

    const server_code = default_server_code;
    const dist_server_code_path = path.join(this.distDir, "index.js");
    const default_package_json = {
      dependencies: {
        express: "4.17.1",
        ejs: "3.1.6",
      },
      scripts: {
        start: "node index.js",
      },
    };

    fs.writeFileSync(
      path.join(this.distDir, "package.json"),
      JSON.stringify(default_package_json, null, 2)
    );
    fs.writeFileSync(dist_server_code_path, server_code);
  }

  copyFolder(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    items.forEach((item) => {
      const srcItemPath = path.join(src, item);
      const destItemPath = path.join(dest, item);
      const stats = fs.statSync(srcItemPath);
      if (stats.isDirectory()) {
        this.copyFolder(srcItemPath, destItemPath);
      } else if (stats.isFile()) {
        fs.copyFileSync(srcItemPath, destItemPath);
      }
    });
  }
}

module.exports = {
  Build,
};
