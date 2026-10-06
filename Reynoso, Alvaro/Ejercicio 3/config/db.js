const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'alvaro123',
    database: 'ejercicio3'
});

module.exports = conexion;