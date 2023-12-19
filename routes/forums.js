try {
  const { Router } = require("../modules");
  const router = new Router();
  const forumsModel = require("../models/forums");
  const usersModel = require("../models/users");
  const repliesModel = require("../models/replies");
  const crypto = require("crypto");
  const uuid = require("uuid");
  const f_reportsModel = require("../models/reports");
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
      res
        .status(500)
        .json({ error: true, message: "Error creating forum post" });
    } else {
      const user1 = usersModel.findOne({ id: userid });
      if (!user1) {
        res
          .status(500)
          .json({ error: true, message: "Error creating forum post" });
      }
      user1.forumPosts.push(forumid);
      user1.points = user1.points + 10;
      usersModel.findAndUpdate({ id: userid }, user1);
      res
        .status(200)
        .json({ message: "Forum post created successfully", success: true });
    }
  });

  router.get("/list/:page/:by/:order", async (req, res) => {
    try {
      let forumPosts = forumsModel.find({});

      const { page, by, order } = req.params;
      let pageInt = parseInt(page);
      let limit = 20;

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

      for (const post of forumPosts) {
        let userid = post.userid;
        let user = await usersModel.findOne({ id: userid }); // Use await for asynchronous operation
        if (user) {
          post.username = user.username;
          post.userimageurl = user.image;
        }
        post.likedBy = null;
        post.dislikedBy = null;
      }

      res.status(200).json(forumPosts);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.delete("/:id", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const forumPost = forumsModel.findOne({
      id: req.params.id,
      userid: user.id,
    });
    if (forumPost) {
      forumsModel.delete({ id: req.params.id });
      res.status(200).json({ message: "Forum post deleted successfully" });
    } else {
      res.status(404).json({ error: true, message: "Forum post not found" });
    }
  });

  router.get("/pagenumber", async (req, res) => {
    try {
      const forumPosts = forumsModel.find({});
      let limit = 20;
      let pageNumber = Math.ceil(forumPosts.length / limit);
      res.status(200).json({
        success: true,
        pageNumber: pageNumber,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.post("/reply/:id", (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const forumPost = forumsModel.findOne({ id });
    if (forumPost) {
      const replyid = uuid.v4();
      repliesModel.insert({
        id: replyid,
        post_id: id,
        user_id: user.id,
        message: comment,
        created_at: new Date().getTime(),
      });
      res.status(200).json({ message: "Reply created successfully" });
    } else {
      res.status(404).json({ error: true, message: "Forum post not found" });
    }
  });

  router.get("/replies/:id/:by/:order/:page", (req, res) => {
    const { id } = req.params;
    const forumPost = forumsModel.findOne({ id });
    const { by, order, page } = req.params;
    const pageInt = parseInt(page);
    let limit = 30;

    if (forumPost) {
      let replies = repliesModel.find({ post_id: id });
      replies.forEach((reply) => {
        const user = usersModel.findOne({ id: reply.user_id });
        if (user) {
          reply.username = user.username;
          reply.imageurl = user.image;
          //check if user has liked or disliked
          if (reply.likedBy.includes(user.id)) {
            reply.liked = true;
          } else {
            reply.liked = false;
          }
          if (reply.dislikedBy.includes(user.id)) {
            reply.disliked = true;
          } else {
            reply.disliked = false;
          }
        }
      });

      if (by === "likes") {
        replies.sort((a, b) => b.likes - a.likes);
      }
      if (by === "date") {
        replies.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      if (by === "dislikes") {
        replies.sort((a, b) => b.dislikes - a.dislikes);
      }

      if (order === "desc") {
        replies.reverse();
      }
      if (pageInt > 0) {
        replies = replies.slice((pageInt - 1) * limit, pageInt * limit);
      }
      res.status(200).json({ replies });
    } else {
      res.status(404).json({ error: true, message: "Forum post not found" });
    }
  });

  router.post("/reply/:id/like", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const { id } = req.params;
    const reply = repliesModel.findOne({ id });
    if (reply) {
      if (reply.likedBy.includes(user.id)) {
        res.status(200).json({ message: "Reply already liked" });
        return;
      }

      if (reply.dislikedBy.includes(user.id)) {
        const dislikedByIndex = reply.dislikedBy.indexOf(user.id);
        reply.dislikedBy.splice(dislikedByIndex, 1);
        repliesModel.findOneAndUpdate(
          { id },
          { dislikedBy: reply.dislikedBy, dislikes: reply.dislikes - 1 }
        );
      }

      reply.likedBy.push(user.id);
      repliesModel.findOneAndUpdate(
        { id },
        { likedBy: reply.likedBy, likes: reply.likes + 1 }
      );

      res
        .status(200)
        .json({ success: true, message: "Reply liked successfully" });
    } else {
      res.status(404).json({ error: true, message: "Reply not found" });
    }
  });

  router.post("/reply/:id/dislike", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const { id } = req.params;
    const reply = repliesModel.findOne({ id });
    if (reply) {
      if (reply.dislikedBy.includes(user.id)) {
        res.status(200).json({ message: "Reply already disliked" });
        return;
      }

      if (reply.likedBy.includes(user.id)) {
        const likedByIndex = reply.likedBy.indexOf(user.id);
        reply.likedBy.splice(likedByIndex, 1);
        repliesModel.findOneAndUpdate(
          { id },
          { likedBy: reply.likedBy, likes: reply.likes - 1 }
        );
      }

      reply.dislikedBy.push(user.id);
      repliesModel.findOneAndUpdate(
        { id },
        { dislikedBy: reply.dislikedBy, dislikes: reply.dislikes + 1 }
      );

      res
        .status(200)
        .json({ success: true, message: "Reply disliked successfully" });
    } else {
      res.status(404).json({ error: true, message: "Reply not found" });
    }
  });

  router.get("/reply/hasliked/:id", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const { id } = req.params;
    const reply = repliesModel.findOne({ id });
    if (reply) {
      if (reply.likedBy.includes(user.id)) {
        res.status(200).json({ liked: true });
      } else {
        res.status(200).json({ liked: false });
      }
    } else {
      res.status(404).json({ error: true, message: "Reply not found" });
    }
  });

  router.get("/reply/hasdisliked/:id", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const { id } = req.params;
    const reply = repliesModel.findOne({ id });
    if (reply) {
      if (reply.dislikedBy.includes(user.id)) {
        res.status(200).json({ disliked: true });
      } else {
        res.status(200).json({ disliked: false });
      }
    } else {
      res.status(404).json({ error: true, message: "Reply not found" });
    }
  });

  router.delete("/reply/:id", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const { id } = req.params;
    const reply = repliesModel.findOne({ id, user_id: user.id });
    if (reply) {
      repliesModel.delete({ id });
      res.status(200).json({ message: "Reply deleted successfully" });
    } else {
      res.status(404).json({ error: true, message: "Reply not found" });
    }
  });

  router.put("/:id/edit", (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const { id } = req.params;
    const { title, content } = req.body;
    const forumPost = forumsModel.findOne({ id, userid: user.id });
    if (forumPost) {
      forumsModel.findOneAndUpdate({ id }, { title, content });
      res.status(200).json({ message: "Forum post updated successfully" });
    } else {
      res.status(404).json({ error: true, message: "Forum post not found" });
    }
  });

  router.get("/:id", (req, res) => {
    const forumPost = forumsModel.findOne({ id: req.params.id });
    if (forumPost) {
      let userid = forumPost.userid;
      let user = usersModel.findOne({ id: userid }); // Use await for asynchronous operation
      if (user) {
        forumPost.username = user.username;
        forumPost.userimageurl = user.image;
      }
      forumPost.likedBy = null;
      forumPost.dislikedBy = null;
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
      userData.likedPosts = userData.likedPosts.filter(
        (postId) => postId !== id
      );
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

  router.post("/report/:id", async (req, res) => {
    const { id } = req.params;
    const user = req.session.user;
    if (!user) {
      res.status(403).json({ error: true, message: "You must be logged in" });
      return;
    }
    const data = await forumsModel.findOne({ id });
    if (data) {
      f_reportsModel.insert({
        id: uuid.v4(),
        user_id: user.id,
        post_id: id,
        reason: req.body.reason,
        created_at: new Date().getTime(),
      });

      res.status(200).json({
        message: "Forum post reported successfully",
        success: true,
      });
    } else {
      res.status(400).json({ error: true, message: "Forum post not found" });
    }
  });

  function md5(data) {
    return crypto.createHash("md5").update(data).digest("hex");
  }

  function rand(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }

  module.exports = router;
} catch (error) {
  console.log(error);
}
