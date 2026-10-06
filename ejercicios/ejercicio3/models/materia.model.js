const db = require('../config/db');

class MateriaModel {
  static async obtenerTodas() {
    const [rows] = await db.query('SELECT * FROM materias ORDER BY nombre ASC');
    return rows;
  }

  static async obtenerPorId(id) {
    const [rows] = await db.query('SELECT * FROM materias WHERE id = ?', [id]);
    return rows[0];
  }

  static async crear(nombre) {
    const [result] = await db.query('INSERT INTO materias (nombre) VALUES (?)', [nombre]);
    return result.insertId;
  }
}

module.exports = MateriaModel;