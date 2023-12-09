const { Table } = require("../modules");
const table = new Table();
table.name = "forum_posts";
table.setSchema({
  id: {
    type: "string",
    required: true,
  },
  userid: {
    type: "string",
    required: true,
  },
  username: {
    type: "string",
    required: true,
  },
  title: {
    type: "string",
    required: true,
  },
  description: {
    type: "string",
    required: true,
  },
  content: {
    type: "string",
    required: true,
  },
  date: {
    type: "string",
    required: true,
  },
  likes: {
    type: "number",
    required: true,
    default: 0,
  },
  dislikes: {
    type: "number",
    required: true,
    default: 0,
  },
  likedBy: {
    type: "object",
    required: true,
    default: [],
  },
  dislikedBy: {
    type: "object",
    required: true,
    default: [],
  },
});

module.exports = table;
