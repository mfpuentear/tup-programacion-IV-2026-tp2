import express from 'express';
import mysql from 'mysql2/promise';
import { body, query, param, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

// Conexion a MySQL usando pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'tp2_ejercicio2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para verificar errores de express-validator
const validarPeticion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};


app.get(
  '/api/tareas',
  [
    query('completada')
      .optional()
      .isBoolean()
      .withMessage('El parametro completada debe ser true o false')
      .toBoolean(),
    validarPeticion
  ],
  async (req, res) => {
    try {
      const { completada } = req.query;
      let sql = 'SELECT * FROM tareas';
      const valores = [];

      if (completada !== undefined) {
        sql += ' WHERE completada = ?';
        valores.push(completada);
      }

      const [rows] = await pool.query(sql, valores);
      res.json(rows);
    } catch (err) {
      console.error('Error al listar tareas:', err);
      res.status(500).json({ error: 'No se pudieron obtener las tareas' });
    }
  }
);

// GET /api/tareas/:id buscar una sola tarea
app.get(
  '/api/tareas/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID invalido'),
    validarPeticion
  ],
  async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM tareas WHERE id = ?', [req.params.id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'La tarea no existe' });
      }

      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al buscar la tarea' });
    }
  }
);

// POST /api/tareas crear tarea nueva
app.post(
  '/api/tareas',
  [
    body('nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isString()
      .customSanitizer((val) => val.trim().toLowerCase()), // normalizamos a minusculas
    body('completada')
      .optional()
      .isBoolean()
      .withMessage('El estado debe ser un booleano')
      .toBoolean(),
    validarPeticion
  ],
  async (req, res) => {
    try {
      const { nombre, completada = false } = req.body;

      // Comprobamos si ya existe una tarea con el mismo nombre
      const [duplicados] = await pool.query(
        'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ?', 
        [nombre]
      );

      if (duplicados.length > 0) {
        return res.status(400).json({ error: 'Ya existe una tarea con ese nombre' });
      }

      const [resultado] = await pool.query(
        'INSERT INTO tareas (nombre, completada) VALUES (?, ?)',
        [nombre, completada]
      );

      res.status(201).json({
        id: resultado.insertId,
        nombre,
        completada
      });
    } catch (err) {
      res.status(500).json({ error: 'Error al crear la tarea' });
    }
  }
);

// PUT /api/tareas/:id editar nombre o estado
app.put(
  '/api/tareas/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID invalido'),
    body('nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre es obligatorio')
      .customSanitizer((val) => val.trim().toLowerCase()),
    body('completada')
      .isBoolean()
      .withMessage('El campo completada debe ser booleano')
      .toBoolean(),
    validarPeticion
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, completada } = req.body;

      // Verificar existencia
      const [existente] = await pool.query('SELECT id FROM tareas WHERE id = ?', [id]);
      if (existente.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      // Evitar nombres duplicados con otras tareas
      const [repetidos] = await pool.query(
        'SELECT id FROM tareas WHERE LOWER(TRIM(nombre)) = ? AND id != ?',
        [nombre, id]
      );
      if (repetidos.length > 0) {
        return res.status(400).json({ error: 'Ya hay otra tarea con el mismo nombre' });
      }

      await pool.query(
        'UPDATE tareas SET nombre = ?, completada = ? WHERE id = ?',
        [nombre, completada, id]
      );

      res.json({ id: Number(id), nombre, completada });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
  }
);

// DELETE /api/tareas/:id borrar tarea
app.delete(
  '/api/tareas/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID invalido'),
    validarPeticion
  ],
  async (req, res) => {
    try {
      const [resultado] = await pool.query('DELETE FROM tareas WHERE id = ?', [req.params.id]);

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      res.json({ mensaje: 'Tarea eliminada exitosamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
  }
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`);
});