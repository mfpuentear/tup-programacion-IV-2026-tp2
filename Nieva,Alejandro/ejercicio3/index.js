import express from 'express';
import mysql from 'mysql2/promise';
import { body, param, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

// Pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'altapaja',
  database: 'tp2_programacion',
  port: 3306
});

// Middleware centralizado de errores de validación
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

const normalizarTexto = (texto) => texto.trim().toLowerCase();

// ==========================================
// REGLAS DE VALIDACIÓN REUTILIZABLES
// ==========================================

const validarNotas = (nombreCampo) =>
  body(nombreCampo)
    .exists().withMessage(`La ${nombreCampo} es obligatoria`)
    .isFloat({ min: 1, max: 10 }).withMessage(`La ${nombreCampo} debe ser un número entre 1 y 10`);

const validacionesCalificacion = [
  body('alumno')
    .exists({ checkFalsy: true }).withMessage('El nombre del alumno es obligatorio')
    .isString().withMessage('El nombre del alumno debe ser una cadena de texto')
    .trim()
    .notEmpty().withMessage('El nombre del alumno no puede estar vacío'),
  body('materia_id')
    .exists().withMessage('El ID de la materia es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la materia debe ser un número entero positivo')
    .custom(async (materiaId) => {
      const [materias] = await pool.query('SELECT id FROM materias WHERE id = ?', [materiaId]);
      if (materias.length === 0) {
        throw new Error('La materia especificada no existe');
      }
      return true;
    }),
  validarNotas('nota1'),
  validarNotas('nota2'),
  validarNotas('nota3')
];

// ==========================================
// RUTAS DE LA API
// ==========================================

// GET /api/materias - Obtener lista de materias
app.get('/api/materias', async (req, res) => {
  try {
    const [materias] = await pool.query('SELECT * FROM materias');
    res.json({ status: 'success', data: materias });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// GET /api/calificaciones - Listar todas las calificaciones con nombre de materia
app.get('/api/calificaciones', async (req, res) => {
  try {
    const querySql = `
      SELECT c.id, c.alumno, m.nombre AS materia, c.nota1, c.nota2, c.nota3,
             ROUND((c.nota1 + c.nota2 + c.nota3) / 3, 2) AS promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
    `;
    const [filas] = await pool.query(querySql);
    res.json({ status: 'success', data: filas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener las calificaciones' });
  }
});

// POST /api/calificaciones - Registrar calificación (con control de unicidad alumno+materia)
app.post(
  '/api/calificaciones',
  [
    ...validacionesCalificacion,
    body().custom(async (value, { req }) => {
      const { alumno, materia_id } = req.body;
      if (alumno && materia_id) {
        const alumnoLimpio = normalizarTexto(alumno);
        const [existente] = await pool.query(
          'SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ?',
          [alumnoLimpio, materia_id]
        );
        if (existente.length > 0) {
          throw new Error('El alumno ya tiene un registro de calificaciones cargado para esta materia');
        }
      }
      return true;
    }),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
      const alumnoLimpio = alumno.trim();

      const [resultado] = await pool.query(
        'INSERT INTO calificaciones (alumno, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
        [alumnoLimpio, materia_id, nota1, nota2, nota3]
      );

      res.status(201).json({
        status: 'success',
        data: {
          id: resultado.insertId,
          alumno: alumnoLimpio,
          materia_id,
          nota1: Number(nota1),
          nota2: Number(nota2),
          nota3: Number(nota3)
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al guardar la calificación' });
    }
  }
);

// PUT /api/calificaciones/:id - Actualizar registro existente (validando unicidad al modificar)
app.put(
  '/api/calificaciones/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de calificación inválido'),
    ...validacionesCalificacion,
    body().custom(async (value, { req }) => {
      const { id } = req.params;
      const { alumno, materia_id } = req.body;
      if (alumno && materia_id) {
        const alumnoLimpio = normalizarTexto(alumno);
        const [existente] = await pool.query(
          'SELECT id FROM calificaciones WHERE LOWER(TRIM(alumno)) = ? AND materia_id = ? AND id != ?',
          [alumnoLimpio, materia_id, id]
        );
        if (existente.length > 0) {
          throw new Error('Ya existe otro registro asignado a este alumno en la misma materia');
        }
      }
      return true;
    }),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { alumno, materia_id, nota1, nota2, nota3 } = req.body;
      const alumnoLimpio = alumno.trim();

      const [resultado] = await pool.query(
        'UPDATE calificaciones SET alumno = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
        [alumnoLimpio, materia_id, nota1, nota2, nota3, id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ status: 'fail', message: 'Registro de calificación no encontrado' });
      }

      res.json({
        status: 'success',
        data: {
          id: Number(id),
          alumno: alumnoLimpio,
          materia_id,
          nota1: Number(nota1),
          nota2: Number(nota2),
          nota3: Number(nota3)
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al actualizar la calificación' });
    }
  }
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});