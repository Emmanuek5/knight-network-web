const { Router } = require("../modules");
const router = new Router();

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
module.exports = router;
