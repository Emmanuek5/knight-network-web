const { Router } = require("../modules");
const userModel = require("../models/users");
const router = new Router();

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
    else if (data.password !== password)
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

router.post("/signup", (req, res) => {
  const { username, password, email } = req.body;

  const data = userModel.findByOr({ username, email });
  if (data.length > 0) {
    res.status(400).json({ error: true, message: "Username already exists" });
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
  const id = uuid.v4();
  let datas = userModel.insertOne({
    id,
    username,
    image: "/assets/user.png",
    rank: "User",
    points: 0,
    password,
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

module.exports = router;
