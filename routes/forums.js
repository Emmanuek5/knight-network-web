const { Router } = require("../modules");
const router = new Router();
const forumsModel = require("../models/forums");
const usersModel = require("../models/users");
const crypto = require("crypto");
const uuid = require("uuid");
router.basePath = "/forums";

router.post("/new", (req, res) => {
  const { title, content } = req.body;
  const user = req.session.user;
  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }
  let description = content.slice(0, 50);
  let date = new Date().toISOString();
  let userid = user.id;
  let username = user.username;
  let forumid = uuid.v4(); // https://www.npmjs.com/package/uuid#v4-uuidv4-d
  forumsModel.insert({
    id: forumid,
    userid,
    username,
    title,
    description,
    content,
    date,
  });
  if (!forumid) {
    res.status(500).json({ error: true, message: "Error creating forum post" });
  } else {
    res
      .status(200)
      .json({ message: "Forum post created successfully", success: true });
  }
});

router.get("/list", (req, res) => {
  const forumPosts = forumsModel.find({});
  forumPosts.forEach((forumPost) => {
    const userid = forumPost.userid;
    const data = usersModel.findOne({ id: userid });
    if (data) {
      forumPost.username = data.username;
      forumPost.userimageurl = data.image;
    } else {
      forumPost.username = "Deleted User";
      forumPost.userimage = "/assets/user.png";
    }
  });
  res.status(200).json(forumPosts);
});

router.get("/:id", (req, res) => {
  const forumPost = forumsModel.findOne({ id: req.params.id });
  if (forumPost) {
    res.status(200).json(forumPost);
  } else {
    res.status(404).json({ error: true, message: "Forum post not found" });
  }
});

router.post("/like/:id", (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const data = forumsModel.findOne({ id });
  const userData = usersModel.findOne({ id: user.id });
  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }

  if (userData.likedPosts.includes(id)) {
    res.status(400).json({ error: true, message: "Post already liked" });
    return;
  }

  forumsModel.findOneAndUpdate({ id }, { likes: data.likes + 1 });
  data.likedBy.push(user.id);
  userData.likedPosts.push(id);
  usersModel.findOneAndUpdate(
    { id: user.id },
    { likedPosts: userData.likedPosts }
  );

  forumsModel.findOneAndUpdate({ id }, { likedBy: data.likedBy });
  res.status(200).json({
    message: "Forum post liked successfully",
    success: true,
  });
});

router.post("/dislike/:id", (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const data = forumsModel.findOne({ id });
  const userData = usersModel.findOne({ id: user.id });

  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }
  if (userData.dislikedPosts.includes(id)) {
    res.status(400).json({ error: true, message: "Post already disliked" });
    return;
  }

  forumsModel.findOneAndUpdate({ id }, { dislikes: data.dislikes + 1 });
  data.dislikedBy.push(user.id);
  userData.dislikedPosts.push(id);
  usersModel.findOneAndUpdate(
    { id: user.id },
    { dislikedPosts: userData.dislikedPosts }
  );

  forumsModel.findOneAndUpdate({ id }, { dislikedBy: data.dislikedBy });
  res.status(200).json({
    message: "Forum post disliked successfully",
    success: true,
  });
});

router.get("/hasliked/:id", (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const data = forumsModel.findOne({ id });
  const userData = usersModel.findOne({ id: user.id });

  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }
  if (userData.likedPosts.includes(id)) {
    res.status(200).json({ liked: true });
  } else {
    res.status(200).json({ liked: false });
  }
});

router.get("/hasdisliked/:id", (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const data = forumsModel.findOne({ id });
  const userData = usersModel.findOne({ id: user.id });

  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }

  if (userData.dislikedPosts.includes(id)) {
    res.status(200).json({ disliked: true });
  } else {
    res.status(200).json({ disliked: false });
  }
});

function md5(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

module.exports = router;
