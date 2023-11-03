const { execSync } = require("child_process");

class Github {
  constructor(app, token) {
    this.app = app;
    this.token = token;
    console.log("Github initialized");
    console.log("Token:", token);
    this.app.post("/webhook/:token", this.handleWebhook.bind(this));
  }

  handleWebhook(req, res) {
    const token = req.params.token;
    const headers = req.headers;
    console.log(headers);
    if (token !== this.token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = req.body;
      if (this.isPushEvent(payload)) {
        this.handlePushEvent(payload);
      }

      res.status(200).send("Webhook received successfully");
    } catch (error) {
      console.error("Error handling webhook:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }

  isPushEvent(payload) {
    return (
      payload &&
      payload.hasOwnProperty("ref") &&
      payload.ref.startsWith("refs/heads/")
    );
  }

  handlePushEvent(payload) {
    const branch = payload.ref.split("/").pop();
    const commit = payload.after;

    // Check if the pushed commit is different from the current commit
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    const currentCommit = execSync("git rev-parse HEAD").toString().trim();

    if (branch === currentBranch && commit !== currentCommit) {
      this.updateRepository();
    }
  }

  updateRepository() {
    console.log("Updating repository...");
    execSync("git pull origin main"); // Assuming the main branch, modify if needed
    console.log("Repository updated successfully");
    this.app.emit("update"); // Notify the main process that the repository has been updated
  }
}

module.exports = {
  Github,
};
