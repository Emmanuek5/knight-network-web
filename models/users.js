const { Table } = require("../modules");
const table = new Table();
table.name = "users";

table.setSchema({
  id: {
    type: "string",
    required: true,
  },
  username: {
    type: "string",
    required: true,
  },
  points: {
    type: "number",
    required: true,
    default: 0,
  },
  likedPosts: {
    type: "object",
    required: true,
    default: [],
  },
  dislikedPosts: {
    type: "object",
    required: true,
    default: [],
  },
  rank: {
    type: "string",
    required: true,
  },
  password: {
    type: "string",
    required: true,
  },
  image: {
    type: "string",
    required: true,
  },
  email: {
    type: "string",
    required: true,
    unique: true,
  },
  bio: {
    type: "string",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  mc_uuid: {
    type: "string",
    default: null,
  },
  linked: {
    type: "boolean",
    default: false,
  },
});

module.exports = table;
