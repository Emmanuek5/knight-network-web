const { Router } = require("../modules");
const router = new Router();
const linksModel = require("../models/links");
const usersModel = require("../models/users");
const crypto = require("crypto");
const { v4 } = require("uuid");
router.basePath = "/link";
const passwordResetModel = require("../models/reset_r");
router.post("/create/:uuid", (req, res) => {
  const { uuid } = req.params;
  const { response_url } = req.body;
  const link = linksModel.findOne({ uuid, linked: true });
  if (link) {
    res.status(200).json({
      error: true,
      message: "You have already linked your account!",
      user_id: link.user_id,
    });
    return;
  }
  const id = v4();
  const url = "https://" + req.headers.host + "/link/" + id;
  const link2 = linksModel.findOne({ uuid });

  if (link2) {
    res.status(200).json({
      error: true,
      message: "You already have a link request opened \n",
      url: link2.url,
    });
    return;
  }
  linksModel.insert({
    uuid,
    id,
    time: new Date().getTime(),
    url: url,
    response_url: response_url || "",
  });
  res.status(200).json({
    message:
      "Use the link below to link your Minecraft account to your account! The link will expire in 24 hours. \n",
    success: true,
    url: url,
  });
});

router.get("/resets/:uuid", (req, res) => {
  const { uuid } = req.params;
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: true, message: "Unauthorized" });
    return;
  }
  const link = passwordResetModel.findOne({
    id: uuid,
    completed: false,
    user_id: req.session.user.id,
  });
  if (link) {
    if (!link.created_at < Date.now() - 86400000) {
      res.status(200).json({
        success: true,
        message: "Password reset link is valid",
        token: link.token,
      });
      return;
    }
    res
      .status(400)
      .json({ error: true, message: "Password reset link expired" });
    return;
  }
  res.status(400).json({ error: true, message: "Invalid password reset link" });
});

router.get("/password-reset/:uuid", (req, res) => {
  const { uuid } = req.params;
  const link = linksModel.findOne({ uuid, linked: true });
  if (link) {
    let id = v4();
    passwordResetModel.insert({
      id,
      user_id: link.user_id,
      uuid: link.uuid,
      completed: false,
      token: genTokem(link.user_id, process.env.PASSWORD_RESET_TOKEN_SECRET),
      created_at: Date.now(),
    });
    const url = "https://" + req.headers.host + "/reset_mc/" + id;
    res.json({
      success: true,
      message: "Password reset link created",
      url: url,
    });
  } else {
    res.status(400).json({ error: true, message: "The User is not linked" });
  }
});

router.get("user/:uuid", (req, res) => {
  const { uuid } = req.params;
  const link = linksModel.findOne({ uuid, linked: true });

  if (link) {
    const user = usersModel.findOne({ id: link.user_id });

    if (user) {
      user.password = undefined;
      res.status(200).json({
        email: user.email,
        username: user.username,
        id: user.id,
        points: user.points,
        rank: user.rank,
      });
      return;
    }
    res.status(404).json({ error: true, message: "User not found" });
  } else {
    res.status(400).json({ error: true, message: "The User is not linked" });
  }
});

router.get("/password-reset/validate/:uuid/:token", (req, res) => {
  const { uuid, token } = req.params;
  const link = passwordResetModel.findOne({ uuid, token, completed: false });
  if (link) {
    link.completed = true;
    passwordResetModel.findOneAndUpdate({ id: link.id }, link);
    res.status(200).json({ success: true, message: "Valid link" });
  } else {
    res.status(400).json({ error: true, message: "Invalid link" });
  }
});

router.post("/:id", (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }
  usersModel.findAndUpdate({ id: user.id }, { linked: true, mc_uuid: id });
  const link = linksModel.findOne({ id, linked: false });
  if (link) {
    //let it expire in 24 hours
    if (link.time + 86400000 > new Date().getTime()) {
      linksModel.findAndUpdate({ id }, { user_id: user.id, linked: true });
      res
        .status(200)
        .json({ message: "Account linked successfully", success: true });
    } else {
      res.status(400).json({ error: true, message: "The link has expired" });
    }
  } else {
    res.status(400).json({ error: true, message: "The link is invalid" });
  }
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const link = linksModel.findOne({ uuid: id, linked: true });
  if (link) {
    res.status(200).json({
      success: true,
      message: "Account linked",
      user_id: link.user_id,
    });
  } else {
    res.status(400).json({ error: true, message: "The User is not linked" });
  }
});

router.get("/mc/:user", async (req, res) => {
  const { user } = req.params;
  const link = await linksModel.findOne({ user_id: user, linked: true });

  if (link) {
    try {
      const response = await fetch(
        "http://localhost:5500/api/player/" + link.uuid
      );
      const plainTextData = await response.text();

      // Parse the plain text response into a JSON object
      const playerData = parsePlainTextResponse(plainTextData);

      const jsonResult = {
        success: true,
        message: "Account linked",
        playerData,
      };

      res.status(200).json(jsonResult);
    } catch (error) {
      console.error("Error fetching player data:", error);
      res.status(500).json({
        error: true,
        message:
          "Error fetching player data, The Minecraft server cannot be reached",
      });
    }
  } else {
    res.status(400).json({ error: true, message: "The User is not linked" });
  }
});

// Function to parse plain text response into JSON object
function parsePlainTextResponse(plainText) {
  const lines = plainText.split("\n");
  const playerData = {};

  lines.forEach((line) => {
    const [key, value] = line.split(": ");
    if (key && value) {
      playerData[key.trim()] = value.trim();
    }
  });

  return playerData;
}

function genTokem(userId, secret) {
  return crypto.createHmac("sha256", secret).update(userId).digest("hex");
}

module.exports = router;
