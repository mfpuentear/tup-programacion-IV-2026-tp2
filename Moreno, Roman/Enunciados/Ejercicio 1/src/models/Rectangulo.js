const pool = require('../config/database');

class Rectangulo {
  // Crear un nuevo rectángulo
  static async crear(lado1, lado2) {
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;
    
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO rectangulos (lado1, lado2, perimetro, superficie) VALUES (?, ?, ?, ?)',
        [lado1, lado2, perimetro, superficie]
      );
      return result;
    } finally {
      connection.release();
    }
  }

  // Obtener todos los rectángulos
  static async obtenerTodos() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM rectangulos');
      return rows;
    } finally {
      connection.release();
    }
  }

  // Obtener un rectángulo por ID
  static async obtenerPorId(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM rectangulos WHERE id = ?',
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  // Actualizar un rectángulo
  static async actualizar(id, lado1, lado2) {
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;
    
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE rectangulos SET lado1 = ?, lado2 = ?, perimetro = ?, superficie = ? WHERE id = ?',
        [lado1, lado2, perimetro, superficie, id]
      );
      return result;
    } finally {
      connection.release();
    }
  }

  // Eliminar un rectángulo
  static async eliminar(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM rectangulos WHERE id = ?',
        [id]
      );
      return result;
    } finally {
      connection.release();
    }
  }
}

module.exports = Rectangulo;