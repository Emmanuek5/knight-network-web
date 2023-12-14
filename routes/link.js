const { Router } = require("../modules");
const router = new Router();
const linksModel = require("../models/links");
const usersModel = require("../models/users");
const crypto = require("crypto");
const { v4 } = require("uuid");
router.basePath = "/link";

router.post("/create/:uuid", (req, res) => {
  const { uuid } = req.params;
  const { response_url } = req.body;
  const link = linksModel.findOne({ uuid, linked: true });
  if (link) {
    res.status(200).json({
      error: true,
      message: "You have already linked your account!",
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
      const response_url = link.response_url;
      if (response_url) {
        fetch(response_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            linked: true,
          }),
        });
      }
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

module.exports = router;
