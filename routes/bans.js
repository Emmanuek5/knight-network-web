const { Router } = require("../modules");
const router = new Router();
const bansModel = require("../models/bans");
const crypto = require("crypto");

router.basePath = "/ban";

router.post("/create", (req, res) => {
  const { username, reason, expiry, isPermanent, uuid } = req.body;

  // Convert isPermanent to boolean
  const isPermanentBoolean = Boolean(isPermanent);
  const id = md5(username + reason + expiry + rand(1, 10000000));
  if (username && reason && expiry) {
    const newBan = bansModel.insertOne({
      id,
      username,
      reason,
      uuid,
      expiry,
      isPermanent: isPermanentBoolean,
    });

    if (!newBan) {
      res.status(400).send(newBan[1]);
      return;
    }

    newBan.save((err) => {
      if (err) {
        console.log(err);
      }
    });
    const json = {
      id,
      message: "Ban created successfully",
    };
    res.status(200).json(json);
  } else {
    res.status(400).send("Missing fields");
  }
});

router.get("/list", (req, res) => {
  const bans = bansModel.find({});
  res.status(200).json(bans);
});

router.put("/update", (req, res) => {
  const { id, key, value } = req.body;
  if (id && key && value) {
    const result = bansModel.findOneAndUpdate({ id: id }, { [key]: value });
    if (!result) {
      res.status(400).json({ message: "Ban not found" });
      return false;
    }
    res.status(200).json({ message: "Ban updated successfully" });
  } else {
    res.status(400).send("Missing fields");
  }
});

router.delete("/delete", (req, res) => {
  const { id } = req.body;
  if (id) {
    const result = bansModel.findAndDeleteOne({ id: id });
    if (!result) {
      res.status(400).json({ message: "Ban not found" });
      return false;
    }

    res.status(200).json({ message: "Ban deleted successfully" });
  } else {
    res.status(400).send("Missing fields");
  }
});

function md5(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

module.exports = router;
