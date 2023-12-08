const { Router } = require("../modules");
const router = new Router();
const fs = require("fs");
const path = require("path");

router.basePath = "/";

router.get("/isAuthenticated", (req, res) => {
  const authenticated = req.session.user ? true : false;
  const status = authenticated ? 200 : 401;
  res.status(status).json({ authenticated });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
  console.log(req.session);
});

router.post("/upload", (req, res) => {
  console.log(req);
  const { filename, content } = req.body;
  fs.writeFileSync(path.join(__dirname, filename), content);
  res.status(200).json({ message: "File uploaded successfully" });
});

module.exports = router;
