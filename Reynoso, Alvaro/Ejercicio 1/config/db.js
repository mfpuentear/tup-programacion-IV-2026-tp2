const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'alvaro123',
    database: 'ejercicio1'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error al conectar con MySQL:', error);
        return;
    }

    console.log('Conectado a MySQL correctamente');
});

module.exports = conexion;