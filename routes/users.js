const { Router } = require("../modules");
const router = new Router();
const userModel = require("../models/users");
const path = require("path");

router.basePath = "/user";

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const user = userModel.findOne({ id });
  user.password = undefined;
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

router.get("/current", (req, res) => {
  const user = req.user;
  res.status(200).json(user);
});

router.patch("/current", (req, res) => {
  const user = req.user;
  const { username, email, bio, image, password, c_password } = req.body;
  if (password && c_password) {
    if (password === c_password) {
      userModel.findOneAndUpdate(
        { id: user.id },
        { username, email, bio, image, password }
      );
    } else {
      res.status(400).json({ error: true, message: "Passwords do not match" });
    }
  } else {
    userModel.findOneAndUpdate(
      { id: user.id },
      { username, email, bio, image }
    );
    req.session.user = userModel.findOne({ id: user.id });
    req.session.save();
  }
  res.status(200).json({ message: "User updated successfully", success: true });
});
router.put("/:id", (req, res) => {
  const { id, key, value } = req.params;
  const user = userModel.findOneAndUpdate({ id }, { [key]: value });
  if (user) {
    res
      .status(200)
      .json({ message: "User updated successfully", success: true });
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

module.exports = router;
