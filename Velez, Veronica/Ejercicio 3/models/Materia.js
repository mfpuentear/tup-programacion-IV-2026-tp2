const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Materia = sequelize.define('Materia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'materias',
  timestamps: false
});

module.exports = Materia;
