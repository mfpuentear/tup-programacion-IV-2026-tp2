const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Rectangulo = sequelize.define('Rectangulo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lado1: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.0001
    }
  },
  lado2: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.0001
    }
  },
  perimetro: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  superficie: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'rectangulos',
  timestamps: false
});

module.exports = Rectangulo;
