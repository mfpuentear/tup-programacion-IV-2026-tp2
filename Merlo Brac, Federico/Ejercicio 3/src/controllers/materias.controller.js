import { pool } from '../config/db.js';

/**
 * Obtiene todas las materias registradas
 */
export async function getAllMaterias(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, nombre, codigo, fecha_creacion FROM materias ORDER BY id ASC');
    return res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene una materia por ID
 */
export async function getMateriaById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, nombre, codigo, fecha_creacion FROM materias WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        mensaje: `No se encontró la materia con ID ${id}`
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Crea una nueva materia asegurando unicidad de nombre y código
 */
export async function createMateria(req, res, next) {
  try {
    const { nombre, codigo } = req.body;
    const nombreLimpio = nombre.trim();
    const codigoLimpio = codigo.trim().toUpperCase();

    // Verificar si ya existe por nombre o código
    const [exist] = await pool.query(
      'SELECT id, nombre, codigo FROM materias WHERE LOWER(nombre) = LOWER(?) OR UPPER(codigo) = ?',
      [nombreLimpio, codigoLimpio]
    );

    if (exist.length > 0) {
      return res.status(409).json({
        status: 'error',
        mensaje: 'Ya existe una materia registrada con ese nombre o código'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO materias (nombre, codigo) VALUES (?, ?)',
      [nombreLimpio, codigoLimpio]
    );

    return res.status(201).json({
      mensaje: 'Materia registrada exitosamente',
      materia: {
        id: result.insertId,
        nombre: nombreLimpio,
        codigo: codigoLimpio
      }
    });
  } catch (error) {
    next(error);
  }
}
