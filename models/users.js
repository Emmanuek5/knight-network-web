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
});

module.exports = table;
