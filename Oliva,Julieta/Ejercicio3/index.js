import express from 'express';
import mysql from 'mysql2/promise';
import { body, param, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

// Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'tp2_ejercicio3',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para procesar errores de express-validator
const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};


// Obtener todas las materias
app.get('/api/materias', async (req, res) => {
  try {
    const [materias] = await pool.query('SELECT * FROM materias');
    res.json(materias);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar las materias' });
  }
});

// Registrar nueva materia
app.post(
  '/api/materias',
  [
    body('nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre de la materia es obligatorio')
      .customSanitizer((val) => val.trim()),
    validar
  ],
  async (req, res) => {
    try {
      const { nombre } = req.body;
      const [resultado] = await pool.query('INSERT INTO materias (nombre) VALUES (?)', [nombre]);
      res.status(201).json({ id: resultado.insertId, nombre });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La materia ya existe' });
      }
      res.status(500).json({ error: 'Error al guardar la materia' });
    }
  }
);


// Obtener todos los registros con el nombre de su materia
app.get('/api/calificaciones', async (req, res) => {
  try {
    const sql = `
      SELECT am.id, am.alumno_nombre, m.nombre AS materia, am.materia_id, am.nota1, am.nota2, am.nota3
      FROM alumnos_materias am
      JOIN materias m ON am.materia_id = m.id
    `;
    const [filas] = await pool.query(sql);
    res.json(filas);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar las calificaciones' });
  }
});

// Registrar notas de un alumno en una materia
app.post(
  '/api/calificaciones',
  [
    body('alumno_nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre del alumno es requerido')
      .customSanitizer((val) => val.trim().toLowerCase()),
    body('materia_id')
      .isInt({ min: 1 })
      .withMessage('ID de materia invalido'),
    body('nota1')
      .isFloat({ min: 1, max: 10 })
      .withMessage('La nota 1 debe estar entre 1 y 10'),
    body('nota2')
      .isFloat({ min: 1, max: 10 })
      .withMessage('La nota 2 debe estar entre 1 y 10'),
    body('nota3')
      .isFloat({ min: 1, max: 10 })
      .withMessage('La nota 3 debe estar entre 1 y 10'),
    validar
  ],
  async (req, res) => {
    try {
      const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;

      // Verificar que la materia exista
      const [materia] = await pool.query('SELECT id FROM materias WHERE id = ?', [materia_id]);
      if (materia.length === 0) {
        return res.status(404).json({ error: 'La materia especificada no existe' });
      }

      // Validar que el alumno no tenga ya notas en esa materia
      const [existe] = await pool.query(
        'SELECT id FROM alumnos_materias WHERE LOWER(TRIM(alumno_nombre)) = ? AND materia_id = ?',
        [alumno_nombre, materia_id]
      );
      if (existe.length > 0) {
        return res.status(400).json({ error: 'El alumno ya tiene notas registradas en esta materia' });
      }

      const [resultado] = await pool.query(
        'INSERT INTO alumnos_materias (alumno_nombre, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
        [alumno_nombre, materia_id, nota1, nota2, nota3]
      );

      res.status(201).json({
        id: resultado.insertId,
        alumno_nombre,
        materia_id,
        nota1,
        nota2,
        nota3
      });
    } catch (err) {
      res.status(500).json({ error: 'Error al guardar las calificaciones' });
    }
  }
);

// Modificar un registro existente
app.put(
  '/api/calificaciones/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID invalido'),
    body('alumno_nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre del alumno es requerido')
      .customSanitizer((val) => val.trim().toLowerCase()),
    body('materia_id')
      .isInt({ min: 1 })
      .withMessage('ID de materia invalido'),
    body('nota1')
      .isFloat({ min: 1, max: 10 })
      .withMessage('La nota 1 debe estar entre 1 y 10'),
    body('nota2')
      .isFloat({ min: 1, max: 10 })
      .withMessage('La nota 2 debe estar entre 1 y 10'),
    body('nota3')
      .isFloat({ min: 1, max: 10 })
      .withMessage('La nota 3 debe estar entre 1 y 10'),
    validar
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;

      // Verificar existencia del registro
      const [registro] = await pool.query('SELECT id FROM alumnos_materias WHERE id = ?', [id]);
      if (registro.length === 0) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }

      // Verificar existencia de la materia
      const [materia] = await pool.query('SELECT id FROM materias WHERE id = ?', [materia_id]);
      if (materia.length === 0) {
        return res.status(404).json({ error: 'La materia especificada no existe' });
      }

      // Prevenir duplicado al modificar
      const [choque] = await pool.query(
        'SELECT id FROM alumnos_materias WHERE LOWER(TRIM(alumno_nombre)) = ? AND materia_id = ? AND id != ?',
        [alumno_nombre, materia_id, id]
      );
      if (choque.length > 0) {
        return res.status(400).json({ error: 'Ya existe otro registro para este alumno en la misma materia' });
      }

      await pool.query(
        'UPDATE alumnos_materias SET alumno_nombre = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
        [alumno_nombre, materia_id, nota1, nota2, nota3, id]
      );

      res.json({ id: Number(id), alumno_nombre, materia_id, nota1, nota2, nota3 });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el registro' });
    }
  }
);

// Borrar registro de calificaciones
app.delete(
  '/api/calificaciones/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID invalido'),
    validar
  ],
  async (req, res) => {
    try {
      const [resul] = await pool.query('DELETE FROM alumnos_materias WHERE id = ?', [req.params.id]);

      if (resul.affectedRows === 0) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }

      res.json({ mensaje: 'Registro de calificaciones eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al borrar el registro' });
    }
  }
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`);
});