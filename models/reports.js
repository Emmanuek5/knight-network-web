const { Table } = require("../modules");
const table = new Table();

table.name = "f_reports";

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
  reason: {
    type: "string",
    required: true,
  },
  created_at: {
    type: "number",
    required: true,
  },
});

module.exports = table;
