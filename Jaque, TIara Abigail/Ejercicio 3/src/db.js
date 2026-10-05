const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'kore123',
    database: 'tup_tp2_calificaciones'
});

module.exports = pool;