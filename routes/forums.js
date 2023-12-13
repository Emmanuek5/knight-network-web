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

router.get("/list/:page/:by", async (req, res) => {
  try {
    const forumPosts = forumsModel.find({});

    const { page, by } = req.params;
    let pageInt = parseInt(page);
    let limit = 20;

    if (by === "likes") {
      forumPosts.sort((a, b) => b.likes - a.likes);
    } else if (by === "date") {
      forumPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      forumPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (pageInt > 0) {
      forumPosts.slice((pageInt - 1) * limit, pageInt * limit);
    }

    for (const post of forumPosts) {
      let userid = post.userid;
      let user = await usersModel.findOne({ id: userid }); // Use await for asynchronous operation
      if (user) {
        post.username = user.username;
        post.userimageurl = user.image;
      }
    }

    res.status(200).json(forumPosts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id", (req, res) => {
  const forumPost = forumsModel.findOne({ id: req.params.id });
  if (forumPost) {
    res.status(200).json(forumPost);
  } else {
    res.status(404).json({ error: true, message: "Forum post not found" });
  }
});

router.post("/like/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }

  const data = await forumsModel.findOne({ id });
  const userData = await usersModel.findOne({ id: user.id });

  if (userData.likedPosts.includes(id)) {
    res.status(400).json({
      error: true,
      message: "You have already liked this post",
    });
    return;
  }

  if (userData.dislikedPosts.includes(id)) {
    // If already disliked, remove the dislike
    forumsModel.findOneAndUpdate({ id }, { dislikes: data.dislikes - 1 });
    userData.dislikedPosts = userData.dislikedPosts.filter(
      (postId) => postId !== id
    );
    data.dislikedBy = data.dislikedBy.filter((userId) => userId !== user.id);
    forumsModel.findOneAndUpdate({ id }, { dislikedBy: data.dislikedBy });
    usersModel.findOneAndUpdate(
      { id: user.id },
      { dislikedPosts: userData.dislikedPosts }
    );
  }
  forumsModel.findOneAndUpdate({ id }, { likes: data.likes + 1 });
  data.likedBy.push(user.id);
  userData.likedPosts.push(id);
  forumsModel.findOneAndUpdate({ id }, { likedBy: data.likedBy });

  res.status(200).json({
    message: "Forum post liked successfully",
    success: true,
  });
});

router.post("/dislike/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }

  const data = await forumsModel.findOne({ id });
  const userData = await usersModel.findOne({ id: user.id });

  if (userData.dislikedPosts.includes(id)) {
    res.status(400).json({
      error: true,
      message: "You have already disliked this post",
    });
    return;
  }

  if (userData.likedPosts.includes(id)) {
    // If already liked, remove the like
    forumsModel.findOneAndUpdate({ id }, { likes: data.likes - 1 });
    userData.likedPosts = userData.likedPosts.filter((postId) => postId !== id);
    data.likedBy = data.likedBy.filter((userId) => userId !== user.id);
    forumsModel.findOneAndUpdate({ id }, { likedBy: data.likedBy });
    usersModel.findOneAndUpdate(
      { id: user.id },
      { likedPosts: userData.likedPosts }
    );
  }
  // If not disliked, add the dislike
  forumsModel.findOneAndUpdate({ id }, { dislikes: data.dislikes + 1 });
  data.dislikedBy.push(user.id);
  userData.dislikedPosts.push(id);
  forumsModel.findOneAndUpdate({ id }, { dislikedBy: data.dislikedBy });

  res.status(200).json({
    message: "Forum post disliked successfully",
    success: true,
  });
});

router.get("/hasliked/:id", (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  if (!user) {
    res.status(403).json({ error: true, message: "You must be logged in" });
    return;
  }
  const data = forumsModel.findOne({ id });
  const userData = usersModel.findOne({ id: user.id });

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
