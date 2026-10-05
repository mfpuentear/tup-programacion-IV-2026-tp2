const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3000),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'kore123',
    database: process.env.DB_NAME || 'tp2_programacion'
});

module.exports = pool;