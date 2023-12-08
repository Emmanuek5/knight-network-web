class Module {
  constructor(name, version) {
    this.name = name;
    this.version = version;
  }
}

class ModuleManager {
  constructor() {
    this.modules = [];
  }

  async downloadModuleFromAPI(apiURL, moduleName) {
    try {
      // Fetch the module from the user-defined API
      const response = await fetch(`${apiURL}/${moduleName}`);
      const module = await response.json();

      // Add the module to the manager
      this.modules.push(module);
      console.log(`Module downloaded: ${module.name}`);
    } catch (error) {
      console.error(
        `Error downloading module ${moduleName} from API:`,
        error.message
      );
    }
  }

  async updateModule(moduleName) {
    const moduleIndex = this.modules.findIndex(
      (module) => module.name === moduleName
    );

    if (moduleIndex !== -1) {
      // Simulate updating the module (replace it with a new version)
      const updatedModule = new Module(moduleName, `2.0`);
      this.modules.splice(moduleIndex, 1, updatedModule);
      console.log(`Module updated: ${updatedModule.name}`);
    } else {
      console.error(`Module ${moduleName} not found.`);
    }
  }

  async installModule(moduleName) {
    // Check if the module is already installed
    if (this.modules.some((module) => module.name === moduleName)) {
      console.log(`Module ${moduleName} is already installed.`);
    } else {
      // Download the module from the API and add it to the manager
      await this.downloadModuleFromAPI(
        "https://example.com/modules",
        moduleName
      );
      console.log(`Module ${moduleName} installed successfully.`);
    }
  }

  listModules() {
    console.log("List of Modules:");
    this.modules.forEach((module) => {
      console.log(`${module.name} (Version: ${module.version})`);
    });
  }
}
