const { Router } = require('express');
const { body, param, query } = require('express-validator');
const pool = require('../config/db');
const { validarCampos } = require('../middlewares/validarCampos');

const router = Router();

// Escala de notas definida: 0.0 a 10.0
const validarNotas = [
  body('nota_1').isFloat({ min: 0, max: 10 }).withMessage('La nota 1 debe ser un número entre 0.0 y 10.0'),
  body('nota_2').isFloat({ min: 0, max: 10 }).withMessage('La nota 2 debe ser un número entre 0.0 y 10.0'),
  body('nota_3').isFloat({ min: 0, max: 10 }).withMessage('La nota 3 debe ser un número entre 0.0 y 10.0'),
];

// GET: Listar calificaciones (con opción de filtrar por alumno)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.nombre_alumno, m.id AS materia_id, m.nombre AS materia, c.nota_1, c.nota_2, c.nota_3,
             ROUND((c.nota_1 + c.nota_2 + c.nota_3) / 3, 2) AS promedio
      FROM calificaciones c
      JOIN materias m ON c.materia_id = m.id
    `);
    res.json({ ok: true, calificaciones: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener calificaciones', error: error.message });
  }
});

// POST: Registrar calificación (Valida alumno, materia existente, tres notas y regla de unicidad)
router.post('/', [
  body('nombre_alumno', 'El nombre del alumno es obligatorio y debe ser texto válido').notEmpty().isString().trim(),
  body('materia_id', 'El ID de la materia debe ser un número entero').isInt(),
  ...validarNotas,
  validarCampos
], async (req, res) => {
  const { nombre_alumno, materia_id, nota_1, nota_2, nota_3 } = req.body;

  try {
    // Validar que la materia exista
    const [materiaRows] = await pool.query('SELECT * FROM materias WHERE id = ?', [materia_id]);
    if (materiaRows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'La materia especificada no existe' });
    }

    // Insertar registro (la restricción UNIQUE de la BD previene duplicados también)
    const [result] = await pool.query(
      'INSERT INTO calificaciones (nombre_alumno, materia_id, nota_1, nota_2, nota_3) VALUES (?, ?, ?, ?, ?)',
      [nombre_alumno, materia_id, nota_1, nota_2, nota_3]
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Calificación registrada exitosamente',
      calificacion: { id: result.insertId, nombre_alumno, materia_id, nota_1, nota_2, nota_3 }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'Violación de regla de unicidad: Ya existe un registro para este alumno en esta materia' 
      });
    }
    res.status(500).json({ ok: false, mensaje: 'Error al registrar calificación', error: error.message });
  }
});

// PUT: Modificar calificación
router.put('/:id', [
  param('id', 'El ID debe ser un número entero').isInt(),
  body('nombre_alumno', 'El nombre del alumno es obligatorio').optional().isString().trim(),
  body('materia_id', 'El ID de la materia debe ser entero').optional().isInt(),
  ...validarNotas.map(val => val.optional()),
  validarCampos
], async (req, res) => {
  const { id } = req.params;
  const { nombre_alumno, materia_id, nota_1, nota_2, nota_3 } = req.body;

  try {
    // Verificar que exista el registro a modificar
    const [existe] = await pool.query('SELECT * FROM calificaciones WHERE id = ?', [id]);
    if (existe.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Calificación no encontrada' });
    }

    const regActual = existe[0];
    const nuevoAlumno = nombre_alumno !== undefined ? nombre_alumno : regActual.nombre_alumno;
    const nuevaMateria = materia_id !== undefined ? materia_id : regActual.materia_id;
    const n1 = nota_1 !== undefined ? nota_1 : regActual.nota_1;
    const n2 = nota_2 !== undefined ? nota_2 : regActual.nota_2;
    const n3 = nota_3 !== undefined ? nota_3 : regActual.nota_3;

    // Si cambian la materia, verificar que exista
    if (materia_id !== undefined) {
      const [materiaRows] = await pool.query('SELECT * FROM materias WHERE id = ?', [materia_id]);
      if (materiaRows.length === 0) {
        return res.status(404).json({ ok: false, mensaje: 'La nueva materia especificada no existe' });
      }
    }

    // Actualizar
    await pool.query(
      'UPDATE calificaciones SET nombre_alumno = ?, materia_id = ?, nota_1 = ?, nota_2 = ?, nota_3 = ? WHERE id = ?',
      [nuevoAlumno, nuevaMateria, n1, n2, n3, id]
    );

    res.json({
      ok: true,
      mensaje: 'Calificación actualizada correctamente',
      calificacion: { id: Number(id), nombre_alumno: nuevoAlumno, materia_id: nuevaMateria, nota_1: n1, nota_2: n2, nota_3: n3 }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'Violación de regla de unicidad: Ya existe otro registro para este alumno en esa materia' 
      });
    }
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar calificación', error: error.message });
  }
});

// DELETE: Eliminar calificación
// DELETE: Eliminar calificación
router.delete('/:id', [
  param('id', 'El ID debe ser un número entero').isInt(),
  validarCampos
], async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM calificaciones WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Calificación no encontrada' });
    }
    res.json({ ok: true, mensaje: 'Calificación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar', error: error.message });
  }
});

module.exports = router;