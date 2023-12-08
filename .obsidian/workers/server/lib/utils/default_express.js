const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

app.set("view engine", "ejs");
let port = 3000;
const pagesPath = path.join(process.cwd(), "/views");
const routesPath = path.join(process.cwd(), "/routes");
if (fs.existsSync(pagesPath) && fs.lstatSync(pagesPath).isDirectory()) {
  fs.readdirSync(pagesPath).forEach((folder) => {
    const folderPath = path.join(pagesPath, folder);
    if (fs.lstatSync(folderPath).isDirectory() || folder.includes("[")) {
      const folderKey = folder.includes("[") ? folder.slice(1, -1) : folder;

      fs.readdirSync(folderPath).forEach((file) => {
        if (file.endsWith(".ejs")) {
          const fileName = file.slice(0, -4); // Remove ".html" extension
          const isIndex = fileName === "index";
          const route = isIndex
            ? `/${folderKey}` // Register index file as /
            : fileName.startsWith("[") &&
              fileName.endsWith("]") &&
              folder.startsWith("[") &&
              folder.endsWith("]")
            ? `/:${folderKey}/:${fileName.slice(1, -1)}`
            : fileName.startsWith("[") && fileName.endsWith("]")
            ? `/${folderKey}/:${fileName.slice(1, -1)}`
            : folder.startsWith("[") && folder.endsWith("]")
            ? `/:${folderKey}${isIndex ? "" : "/"}${fileName}`
            : `/${folderKey}${isIndex ? "" : "/"}${fileName}`;

          registerRoute(route, folder, fileName);
        }
      });
    } else if (folder.endsWith(".ejs")) {
      const fileName = folder.slice(0, -4); // Remove ".html" extension
      const isIndex = fileName === "index";
      const route = isIndex
        ? "/" // Register index file as /
        : fileName.startsWith("[") && fileName.endsWith("]")
        ? `/:${fileName.slice(1, -1)}`
        : `/${fileName}`;

      registerRoute(route, "", fileName);
    }
  });
} else {
  throw new Error("The pages folder does not exist");
}

function registerRoute(route, folder, fileName) {
  app.get(route, (req, res) => {
    // Render the page corresponding to the route
    // You can customize this part based on your rendering logic
    const params = req.params;
    path.join(process.cwd(), `/pages/${folder}/${fileName}`);
    const filename = path.basename(`${folder}/${fileName}`);
    if (folder === "") {
      res.render(`${folder}${filename}`, { ...params });
    } else {
      res.render(`${folder}/${filename}`, { ...params });
    }
  });
}

app.get("/favicon.ico", (req, res) => {
  const faviconPath = path.join(process.cwd(), "public/favicon.ico");
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    const defaultFaviconPath = path.join(__dirname, "assets/favicon.ico");
    res.sendFile(defaultFaviconPath);
  }
});

// Serve static files using express.static middleware
app.use("/assets", express.static(path.join(process.cwd(), "/assets")));
app.use("/public", express.static(path.join(process.cwd(), "/public")));
app.use("/scripts", express.static(path.join(process.cwd(), "/public/js")));
app.use("/styles", express.static(path.join(process.cwd(), "/public/css")));

app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(process.cwd(), "public/robots.txt");
  if (fs.existsSync(robotsPath)) {
    res.sendFile(robotsPath);
  } else {
    const defaultRobotsPath = path.join(__dirname, "assets/robots.txt");
    res.sendFile(defaultRobotsPath);
  }
});

app.listen(port, () => {
  console.log("Built Server Started on Port " + port);
});

module.exports = port;
