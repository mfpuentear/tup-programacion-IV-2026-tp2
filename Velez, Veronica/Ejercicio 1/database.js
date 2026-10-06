const { Sequelize } = require('sequelize');

// Configuración de la base de datos
// Se utiliza SQLite por defecto para facilitar la ejecución local y las pruebas,
// pero el diseño y modelo es totalmente compatible con MySQL (sólo requiere cambiar el dialecto).
// Para usar MySQL:
// const sequelize = new Sequelize('tp2', 'usuario', 'contraseña', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

module.exports = sequelize;
