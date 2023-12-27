const { Table } = require("../modules");
const table = new Table();

table.name = "reset_requests";

table.setSchema({
  id: {
    type: "string",
    required: true,
  },
  user_id: {
    type: "string",
    required: true,
  },
  uuid: {
    type: "string",
    required: true,
  },
  token: {
    type: "string",
    required: true,
  },

  completed: {
    type: "boolean",
    required: true,
  },
  created_at: {
    type: "number",
    required: true,
  },
});

module.exports = table;
