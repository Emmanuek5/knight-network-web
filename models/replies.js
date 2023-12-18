const { Table } = require("../modules");
const table = new Table();

table.name = "replies";

table.setSchema({
  id: {
    type: "string",
    required: true,
  },
  user_id: {
    type: "string",
    required: true,
  },
  post_id: {
    type: "string",
    required: true,
  },
  message: {
    type: "string",
    required: true,
  },
  created_at: {
    type: "number",
    required: true,
  },
  likedBy: {
    type: "object",
    required: false,
    default: [],
  },
  dislikedBy: {
    type: "object",
    required: false,
    default: [],
  },
  likes: {
    type: "number",
    required: false,
    default: 0,
  },
  dislikes: {
    type: "number",
    required: false,
    default: 0,
  },
});

module.exports = table;
