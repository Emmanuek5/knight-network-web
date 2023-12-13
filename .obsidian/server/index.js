const { server, Config, Router, Table } = require("../../modules");
const app = server();
const config = new Config();
const port = config.get("port");
const path = require("path");
const fs = require("fs");
const { Database } = require("../workers/database");
const defaultPath = process.cwd();
const pagesPath = path.join(defaultPath, "pages");
const routesPath = path.join(defaultPath, "routes");
const tablesPath = path.join(defaultPath, "models");
const { spawn } = require("child_process");
const requestCount = new Map();
let portdb = null;
let url = null;
let remote = false;
if (
  config.get("db_port") !== undefined &&
  config.get("db_port") !== "" &&
  config.get("db_port") !== null
) {
  portdb = config.get("db_port");
} else {
  portdb = 6379;
}
if (!config.get("db_url") === undefined && config.get("db_url") !== "") {
  url = config.get("db_url");
  remote = true;
} else {
  url = "database";
}

const rate_config = config.get("rate_limits");

if (rate_config.enabled) {
  if (!rate_config.duration) {
    rate_config.duration = 60;
  }
  if (!rate_config.max) {
    rate_config.max = 100;
  }
}

app.server.on("request", (req, res) => {
  const ipAddress = req.ip;

  // Initialize request count for the IP address
  if (!requestCount.has(ipAddress)) {
    requestCount.set(ipAddress, 1);

    // Set a timer to reset the count after the duration
    setTimeout(() => {
      requestCount.delete(ipAddress);
    }, rate_config.duration * 1000);
  } else {
    // Increment the request count
    requestCount.set(ipAddress, requestCount.get(ipAddress) + 1);
    // Check if the request count exceeds the maximum allowed
    if (requestCount.get(ipAddress) > rate_config.max) {
      res.setHeader("Retry-After", rate_config.duration);
      res.status(429).send("Too many requests");
      return;
    }
  }
});

if (config.get("auto_update") === true) {
  const { Github } = require("../workers/github");
  const github = new Github(app, config.get("github_webhook_secret"));
  github.inatialiseRepoIfNoneExists();
  github.setGlobalPullConfig();
}
const database = new Database(url, portdb, remote);
process.env.VIEWS_PATH = pagesPath;
process.env.VIEW_ENGINE = config.get("view_engine");

if (fs.existsSync(tablesPath) && fs.lstatSync(tablesPath).isDirectory()) {
  fs.readdirSync(tablesPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const table = require(path.join(tablesPath, file));
      if (table instanceof Table) {
        let tableName = table.name;
        if (tableName === "") {
          console.error("Table name is not defined");
        }
        database.add(table);
      } else {
      }
    }
  });
}

if (fs.existsSync(pagesPath) && fs.lstatSync(pagesPath).isDirectory()) {
  fs.readdirSync(pagesPath).forEach((folder) => {
    const folderPath = path.join(pagesPath, folder);
    if (fs.lstatSync(folderPath).isDirectory() || folder.includes("[")) {
      const folderKey = folder.includes("[") ? folder.slice(1, -1) : folder;

      fs.readdirSync(folderPath).forEach((file) => {
        if (file.endsWith(".html")) {
          const fileName = file.slice(0, -5); // Remove ".html" extension
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
    } else if (folder.endsWith(".html")) {
      const fileName = folder.slice(0, -5); // Remove ".html" extension
      const isIndex = fileName === "index";
      const route = isIndex
        ? "/" // Register index file as /
        : fileName.startsWith("[") && fileName.endsWith("]")
        ? `/:${fileName.slice(1, -1)}`
        : `/${fileName}`;

      registerRoute(route, "/", fileName);
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
    params.authenticated = req.session.user ? true : false;
    path.join(process.cwd(), `/pages/${folder}/${fileName}`);
    const filename = path.basename(`${folder}/${fileName}`);
    res.render(`${folder}/${filename}`, params);
  });
}

app.get("/favicon.ico", (req, res) => {
  const faviconPath = path.join(process.cwd(), "public/favicon.ico");
  if (fs.existsSync(faviconPath)) {
    res.file(faviconPath);
  } else {
    const defaultFaviconPath = path.join(__dirname, "assets/favicon.ico");
    res.file(defaultFaviconPath);
  }
});

const asset_dirs = config.get("asset_dirs");

if (asset_dirs) {
  for (const asset_dir of asset_dirs) {
    let dir = path.join(process.cwd(), asset_dir.path) || "";
    let httpPath = asset_dir.url || "";
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
      throw new Error("Directory does not exist: " + dir);
    }
    app.dir(dir, httpPath);
  }
}

const workers = config.get("workers");

if (workers) {
  for (const worker of workers) {
    let routesPath = path.join(process.cwd(), worker.path) || "";
    let baseUrl = worker.baseurl || "";
    if (!fs.existsSync(routesPath) || !fs.lstatSync(routesPath).isDirectory()) {
      throw new Error("Directory does not exist: " + routesPath);
    }
    if (worker.enabled) {
      fs.readdirSync(routesPath).forEach((file) => {
        if (file.endsWith(".js")) {
          const router = require(path.join(routesPath, file));
          if (router instanceof Router) {
            let basePath = router.basePath;
            if (!basePath.startsWith("/")) {
              basePath = `/${basePath}`;
            }
            app.use(baseUrl + basePath, path.join(routesPath, file));
          } else {
            throw new Error("The router file must export a Router instance");
          }
        }
      });
    }
  }
}

app.use("/public", path.join(process.cwd(), "/public"));
app.use("/scripts", path.join(process.cwd(), "/public/js"));
app.use("/styles", path.join(process.cwd(), "/public/css"));

fs.readdir(path.join(__dirname, "resources"), (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(__dirname, "resources", file);
    app.get("/server/" + file, (req, res) => {
      res.file(filePath);
    });
  });
});
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(process.cwd(), "public/robots.txt");
  if (fs.existsSync(robotsPath)) {
    res.file(robotsPath);
  } else {
    const defaultRobotsPath = path.join(__dirname, "assets/robots.txt");
    res.file(defaultRobotsPath);
  }
});

app.post("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, (port) => {
  if (port === 80) {
    console.log(`Server listening on http://localhost/`);
    //openUrlInBrowser("http://localhost/");
  } else {
    console.log(`Server listening on http://localhost:${port}`);
    //openUrlInBrowser(`http://localhost:${port}`);
  }
});

function openUrlInBrowser(url) {
  if (process.platform === "win32") {
    spawn("rundll32", ["url.dll,FileProtocolHandler", url], { shell: true });
  } else if (process.platform === "darwin") {
    spawn("open", [url]);
  } else {
    spawn("xdg-open", [url]);
  }
}
