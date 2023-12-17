const { Router } = require("../modules");
const router = new Router();
const userModel = require("../models/users");
const path = require("path");
const forumPostsModel = require("../models/forums");
const linksModel = require("../models/links");
const {
  getPlayerInfo,
  parsePlainTextResponse,
} = require("./functions/functions");

router.basePath = "/user";

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = userModel.findOne({ id });
  user.password = undefined;
  if (user) {
    if (user.linked) {
      const link = linksModel.findOne({ user_id: user.id, linked: true });
      if (link) {
        try {
          const response = await fetch(
            "http://localhost:5500/api/player/" + link.uuid
          );
          const plainTextData = await response.text();

          // Parse the plain text response into a JSON object
          const playerData = parsePlainTextResponse(plainTextData);
          user.playerData = playerData;
        } catch (error) {
          console.log("Error fetching player data:", error);
        }
      }
    }
    res.status(200).json(user);
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

router.get("/current", (req, res) => {
  const user = userModel.findOne({ id: req.user.id });
  user.password = undefined;
  res.status(200).json(user);
});

router.get("/current/profile", (req, res) => {
  const user_id = req.user.id;
  const user = userModel.findOne({ id: user_id });
  if (user) {
    let forumPosts = [];
    let likedPosts = [];
    user.likedPosts.forEach((post) => {
      const likedPost = forumPostsModel.findOne({ id: post });
      if (likedPost) {
        likedPosts.push(likedPost);
      }
    });
    user.forumPosts.forEach((post) => {
      const forumPost = forumPostsModel.findOne({ id: post });
      if (forumPost) {
        forumPosts.push(forumPost);
      }
    });
    user.likedPosts = likedPosts;
    user.forumPosts = forumPosts;
    res.status(200).json({ user });
  }
});

router.post("/current/image", (req, res) => {
  const { files } = req;
  const user = req.user;
  try {
    if (user) {
      const { image } = files;
      if (image) {
        const { type } = image[0];
        if (type.startsWith("image/")) {
          const name = image[0].name;
          let fname = "assets/images/" + name;
          let fPath = path.join(__dirname, "..", fname);
          image[0].mv(fPath, (err) => {
            if (err) {
              res.status(400).json({ error: true, message: err });
            } else {
              user.image = fname;

              userModel.findOneAndUpdate(
                { id: user.id },
                { image: "/" + fname }
              );
              res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
              });
            }
          });
        } else {
          res.status(400).json({ error: true, message: "Invalid image type" });
        }
      } else {
        res.status(400).json({ error: true, message: "No image provided" });
      }
    } else {
      res.status(400).json({ error: true, message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/current/forum_posts/:page/:by/:order", (req, res) => {
  const user_id = req.user.id;
  const user = userModel.findOne({ id: user_id });
  const { page, by, order } = req.params;
  const pageInt = parseInt(page);
  let forumPosts = forumPostsModel.find({ userid: user_id });
  let limit = 10;
  if (by === "likes") {
    forumPosts.sort((a, b) => b.likes - a.likes);
  } else if (by === "date") {
    forumPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (by === "dislikes") {
    forumPosts.sort((a, b) => b.dislikes - a.dislikes);
  } else {
    forumPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  if (pageInt > 0) {
    forumPosts = forumPosts.slice((pageInt - 1) * limit, pageInt * limit);
  }
  if (order === "desc") {
    forumPosts.reverse();
  }

  res.status(200).json({ forumPosts });
});

router.get("/current/forum_posts/pagenumber", (req, res) => {
  const user_id = req.user.id;
  const user = userModel.findOne({ id: user_id });
  const forumPosts = forumPostsModel.find({ userid: user_id });
  let limit = 10;
  let pageNumber = Math.ceil(forumPosts.length / limit);
  res.status(200).json({
    success: true,
    pageNumber: pageNumber,
  });
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
