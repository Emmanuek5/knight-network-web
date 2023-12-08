const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const { COLORS } = require("../workers/obsidian/colours");
const { Config } = require("../workers/config/index");
const ncp = require("ncp").ncp;
const config = new Config();
const workingPath = process.cwd();
const cache_folder = path.join(workingPath, ".obsidian/workers/electron/");
const cache_dir = fs.readdirSync(cache_folder);
const assets_folder = path.join(workingPath, "assets");
const public_folder = path.join(workingPath, "public");
const pages_folder = path.join(workingPath, "pages");
const args = process.argv.slice(2);
const logger = (message, color = COLORS.BLUE_TEXT) => {
  console.log(
    COLORS.YELLOW_TEXT +
      "[APP ENGINE LOGS] - " +
      COLORS.applyColor(message, color)
  );
};
const logError = (error) => {
  console.error(
    COLORS.RED_TEXT + "[APP ENGINE ERROR] - " + error.toString().trim(),
    COLORS.RESET
  );
};

const preloadFilePath = path.join(workingPath, config.get("electron").preload);

ncp(assets_folder, path.join(cache_folder, "assets"), (err) => {
  if (err) {
    logError(`Error copying assets: ${err}`);
  } else {
    logger("Assets copied successfully!");
  }
});

ncp(public_folder, path.join(cache_folder, "public"), (err) => {
  if (err) {
    logError(`Error copying public folder: ${err}`);
  } else {
    logger("Public folder copied successfully!");
  }
});

ncp(pages_folder, path.join(cache_folder, "pages"), (err) => {
  if (err) {
    logError(`Error copying pages folder: ${err}`);
  } else {
    logger("Pages folder copied successfully!");
  }
});

cache_dir.forEach((file) => {
  if (file.startsWith("electron-")) {
    fs.unlinkSync(path.join(cache_folder, file));
  }
});
let electron_file = fs
  .readFileSync(path.join(workingPath, "electron.js"))
  .toString();
const config_engine = fs.readFileSync(
  path.join(workingPath, ".obsidian/workers/config/index.js")
);
const config_file = fs.readFileSync(
  path.join(workingPath, "obsidian.config.json")
);

const electron_workers_file = fs.readFileSync(
  path.join(workingPath, ".obsidian/workers/electron/index.js"),
  "utf-8"
);
const electron_workers_package = JSON.parse(
  fs.readFileSync(
    path.join(workingPath, ".obsidian/workers/electron/package.json"),
    "utf-8"
  )
);
const electron_conf = config.get("electron");
if (!electron_conf.enabled) {
  logger("Electron is disabled");
  logger("Exiting...");
  process.exit(0);
}

let modules = [];
let jj_89 = config.get("electron").modules;
modules.push(...jj_89);

// Create an array to store the new require statements
let newRequireStatements = [];

modules.forEach((module) => {
  const actualModulePath = path.join(workingPath, module.file);
  // Replace single backslashes with double backslashes in the path
  const sanitizedPath = actualModulePath.replace(/\\/g, "\\\\");
  // Create a require statement for the module
  const requireStatement = `const ${module.name} = require('${sanitizedPath}');`;
  logger("Requiring " + actualModulePath);
  // Add the require statement to the array
  newRequireStatements.push(requireStatement);
});

if (!fs.existsSync(preloadFilePath)) {
  // Create the directory if it doesn't exist in the cache folder
  const preloadCacheFolder = path.join(
    cache_folder,
    path.dirname(config.get("electron").preload)
  );

  if (!fs.existsSync(preloadCacheFolder)) {
    fs.mkdirSync(preloadCacheFolder, { recursive: true });
  }

  const filedata = fs.readFileSync(preloadFilePath);
  const content = reStructureImports(filedata.toString());
  fs.readFileSync(path.join(preloadCacheFolder, "preload.js"), content);

  logger("Preload file copied successfully!");
}

let content = `${electron_workers_file}\n${removeImports(
  config_engine.toString()
)}\n${removeImports(electron_file)}`;

// Create the final content by combining newRequireStatements and existing content
const updatedContent = newRequireStatements.join("\n") + "\n" + content;

if (!fs.existsSync(cache_folder)) {
  fs.mkdirSync(cache_folder, { recursive: true });
}

const rand =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
const file_path = path.join(cache_folder, "electron-" + rand + ".js");
const config_path = path.join(cache_folder, "obsidian.config.json");
let ww_34 = removeImports(config_file.toString());
fs.writeFileSync(config_path, ww_34);
fs.writeFileSync(file_path, updatedContent);

electron_workers_package.main = file_path;
const requireRegex = /require\(['"](.*)['"]\)/g;
const requireMatches = requireRegex.exec(electron_workers_file);

const electron_path = path.join(workingPath, ".obsidian/workers/electron");
fs.writeFileSync(
  path.join(electron_path, "package.json"),
  JSON.stringify(electron_workers_package)
);

let main_process;
try {
  if (args[0] == "--no-server") {
    logger("Starting without server...");
  } else {
    let argsv = ["start"];

    main_process = spawn("npm", argsv, {
      shell: true,
      cwd: workingPath,
    });

    main_process.stdout.on("data", (data) => {
      console.log(data.toString().trim());
    });
    main_process.stderr.on("data", (data) => {
      console.log(data.toString().trim());
    });
  }
} catch (e) {
  logError(e);
}

try {
  let args = ["start"];
  const electron_process = spawn("npm", args, {
    shell: true,
    cwd: electron_path,
  });
  electron_process.stdout.on("data", (data) => {
    logger(data.toString().trim());
  });

  electron_process.stderr.on("data", (data) => {
    logError(data.toString().trim());
  });

  electron_process.on("error", function (error) {
    logError(error);
  });

  electron_process.on("exit", function (code, signal) {
    if (fs.existsSync(file_path)) {
      logger("Electron process exited with code: " + code);
      fs.unlinkSync(file_path);
      if (main_process) {
        try {
          main_process.kill();
        } catch (error) {
          logError(error);
        }
      }
      process.exit(0);
    }
  });

  electron_process.on("close", function (code, signal) {
    if (fs.existsSync(file_path)) {
      logger("Electron process exited with code: " + code);
      fs.unlinkSync(file_path);
      if (main_process) {
        try {
          main_process.kill();
        } catch (error) {
          logError(error);
        }
      }
      process.exit(0);
    }
  });
} catch (error) {
  logError(error);
}

function removeImports(content) {
  const regex = /const (.*) = require\(['"](.*)['"]\);/g;
  let updatedContent = content;
  let matches;

  while ((matches = regex.exec(content)) !== null) {
    const importStatement = matches[0];
    updatedContent = updatedContent.replace(importStatement, "");
  }

  return updatedContent;
}

function reStructureImports(content) {
  const regex = /const (.*) = require\(['"](.*)['"]\);/g;
  let updatedContent = content;
  let matches;

  while ((matches = regex.exec(content)) !== null) {
    const importStatement = matches[0];
    const variableName = matches[1];
    const moduleName = matches[2];

    // Check if the module is a default Node.js package
    const isDefaultPackage = ["fs", "path", "process"].includes(moduleName);

    // Use path.join to get the actual file path for non-default packages
    const actualModule = isDefaultPackage
      ? moduleName
      : require.resolve(moduleName);

    const newImportStatement = `const ${variableName} = require('${actualModule}');`;

    updatedContent = updatedContent.replace(
      importStatement,
      newImportStatement
    );
  }

  return updatedContent;
}
