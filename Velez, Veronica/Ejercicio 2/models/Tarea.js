const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Tarea = sequelize.define('Tarea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  completada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'tareas',
  timestamps: false
});

module.exports = Tarea;
