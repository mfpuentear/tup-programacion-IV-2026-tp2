const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Materia = require('./Materia');

const Calificacion = sequelize.define('Calificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alumno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nota1: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  nota2: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  nota3: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'calificaciones',
  timestamps: false
});

Materia.hasMany(Calificacion, { foreignKey: 'materiaId' });
Calificacion.belongsTo(Materia, { foreignKey: 'materiaId' });

module.exports = { Calificacion, Materia };
