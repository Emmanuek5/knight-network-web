const {Table} = require("../modules");
const table = new Table();

table.name = "bans";

table.setSchema({
  id: {
    type: "string",
    required: true
  },
  username: {
    type: "string",
    required: true,
  },
  uuid: {
    type: "string",
    required: true,
  },
  reason: {
    type: "string",
    required: true,
  },
  expiry: {
    type: "string",
    required: true,
  },
  isPermanent: {
    type: "boolean",
    required: true,
  }
});

module.exports = table;