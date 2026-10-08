const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Si tu MySQL de XAMPP / MariaDB tiene clave, ponela acá
  database: 'tp2_ejercicio2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;