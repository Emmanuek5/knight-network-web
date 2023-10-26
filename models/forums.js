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
});

module.exports = table;
