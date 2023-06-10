require('dotenv/config')
const mysql2 = require("mysql2");

const db = mysql2.createConnection({
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_DATABASE,
});

module.exports = db;