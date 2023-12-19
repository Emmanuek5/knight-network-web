const { Router } = require("../modules");
const userModel = require("../models/users");
const router = new Router();
const path = require("path");
const crypto = require("crypto");
const uuid = require("uuid");
router.basePath = "/auth";

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const emailregex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  let data;

  if (username && password) {
    if (emailregex.test(username)) {
      data = userModel.findOne({ email: username });
    }

    data = userModel.findOne({ username });

    if (!data) res.status(400).json({ error: true, message: "User not found" });
    else if (data.password !== md5(password))
      res.status(400).json({ error: true, message: "Incorrect password" });
    else {
      req.session.user = {
        username: data.username,
        image: data.image,
        bio: data.bio,
        rank: data.rank,
        points: data.points,
        email: data.email,
        id: data._id,
      };
      req.session.save();
      const json = {
        success: true,
        message: "Login successful",
      };
      res.status(200).json(json);
    }
  } else {
    res.status(400).json({
      error: true,
      message: "Missing fields",
      fields: { username, password },
    });
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, email, c_password } = req.body;
  const file = req.file;
  const data = userModel.findByOr({ username, email });
  if (data.length > 0) {
    res
      .status(400)
      .json({ error: true, message: "Username or email already exists" });
    return;
  }
  const securePasswordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;
  if (!securePasswordRegex.test(password)) {
    res.status(400).json({
      error: true,
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
    return;
  }

  if (password !== c_password) {
    res.status(400).json({ error: true, message: "Passwords do not match" });
    return;
  }

  if (!file) {
    res.status(400).json({ error: true, message: "Missing image" });
    return;
  }

  const image = `/assets/images/${file.filename}`;
  await file.mv(path.join(process.cwd(), image), (err) => {
    if (err) {
      res.status(500).json({ error: true, message: "Failed to upload image" });
      return;
    }
  });
  const id = uuid.v4();
  const hashedPassword = md5(password);
  let datas = userModel.insertOne({
    id,
    username,
    image,
    rank: "User",
    points: 0,
    password: hashedPassword,
    email,
  });
  if (!datas) {
    res.status(400).json({ error: true, message: "Signup failed" });
    return;
  }
  const json = {
    success: true,
    message: "Signup successful",
  };
  res.status(200).json(json);
});

function md5(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

module.exports = router;
