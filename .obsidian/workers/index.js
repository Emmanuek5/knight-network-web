const server = require('./server/index');
const {Router} = require('./server/lib/router/router');
const {Config} = require('./config/index');
const { COLORS } = require('./obsidian/colours');
const { Table } = require('./database');
module.exports = {
    Config,
    Router,
    server,
    Build: server.builder,
    COLORS,
    Table,
}