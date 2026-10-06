import express from 'express';
import mysql from 'mysql2/promise';
import { body, query, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

// Configuración del pool de conexiones a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'altapaja', 
  database: 'tp2_programacion',
  port: 3306
});

// Middleware centralizado para el manejo de errores de express-validator
const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errores: errores.array().map(err => ({
        campo: err.path,
        mensaje: err.msg
      }))
    });
  }
  next();
};

// Criterio de comparación normalizado (insensible a mayúsculas y espacios extra)
const normalizarTexto = (texto) => texto.trim().toLowerCase();

// ==========================================
// RUTAS DE LA API
// ==========================================

/**
 * GET /api/tareas
 * Permite listar todas las tareas o filtrar por estado (?completada=true/false)
 */
app.get(
  '/api/tareas',
  [
    query('completada')
      .optional()
      .isBoolean()
      .withMessage('El parámetro completada debe ser un valor booleano (true o false)'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { completada } = req.query;
      let querySql = 'SELECT id, nombre, completada FROM tareas';
      const params = [];

      if (completada !== undefined) {
        querySql += ' WHERE completada = ?';
        params.push(completada === 'true' || completada === '1');
      }

      const [filas] = await pool.query(querySql, params);

      // Convertimos el valor entero/booleano de MySQL a booleano de JavaScript
      const tareasFormatted = filas.map(t => ({
        ...t,
        completada: Boolean(t.completada)
      }));

      res.json({
        status: 'success',
        data: tareasFormatted
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
  }
);

/**
 * POST /api/tareas
 * Crea una nueva tarea respetando unicidad de nombre y tipo booleano en completada
 */
app.post(
  '/api/tareas',
  [
    body('nombre')
      .exists({ checkFalsy: true }).withMessage('El nombre es obligatorio')
      .isString().withMessage('El nombre debe ser una cadena de texto')
      .trim()
      .notEmpty().withMessage('El nombre no puede estar vacío ni contener solo espacios')
      .custom(async (value) => {
        const nombreNormalizado = normalizarTexto(value);
        const [existentes] = await pool.query(
          'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ?',
          [nombreNormalizado]
        );
        if (existentes.length > 0) {
          throw new Error('Ya existe una tarea registrada con ese nombre');
        }
        return true;
      }),
    body('completada')
      .optional()
      .isBoolean().withMessage('El estado completada debe ser un valor booleano'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { nombre, completada = false } = req.body;
      const nombreLimpio = nombre.trim();

      const [resultado] = await pool.query(
        'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
        [nombreLimpio, completada]
      );

      res.status(201).json({
        status: 'success',
        data: {
          id: resultado.insertId,
          nombre: nombreLimpio,
          completada: Boolean(completada)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error al registrar la tarea' });
    }
  }
);

// Inicio del servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});