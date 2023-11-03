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

router.post("/:id/upload", (req, res) => {
  const { id } = req.params;
  const { image, text } = req.files;
  console.log(req.files);

  if (!image) {
    res.status(400).json({ error: "No image uploaded" });
    return;
  } else if (image.type !== "image/png" && image.type !== "image/jpeg") {
    res.status(400).json({ error: "Invalid image format" });
    return;
  }
  image.mv(path.join(__dirname, "..", "assets", `${id}.png`), (err) => {
    if (err) {
      res.status(500).json({ error: "Error uploading image" });
    }
  });

  if (user) {
    res
      .status(200)
      .json({ message: "User updated successfully", success: true });
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

module.exports = router;
