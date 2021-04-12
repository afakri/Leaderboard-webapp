const { Pool } = require("pg");
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});
module.exports = {
    query: (text, params) => pool.query(text, params),
}