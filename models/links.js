const { Table } = require("../modules");
const table = new Table();

table.name = "links";

table.setSchema({
  uuid: {
    type: "string",
    required: true,
  },
  id: {
    type: "string",
    required: true,
  },
  time: {
    type: "number",
    required: true,
  },
  url: {
    type: "string",
    required: true,
  },
  user_id: {
    type: "string",
    default: "",
  },
  linked: {
    type: "boolean",
    default: false,
  },
  response_url: {
    type: "string",
    default: "",
  },
});

module.exports = table;
