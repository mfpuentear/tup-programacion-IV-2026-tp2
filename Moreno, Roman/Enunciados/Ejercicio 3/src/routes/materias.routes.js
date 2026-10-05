const { Router } = require('express');
const { body } = require('express-validator');
const pool = require('../config/db');
const { validarCampos } = require('../middlewares/validarCampos');

const router = Router();

// GET: Listar materias
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM materias');
    res.json({ ok: true, materias: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener materias', error: error.message });
  }
});

// POST: Crear materia
router.post('/', [
  body('nombre', 'El nombre de la materia es obligatorio y debe ser texto válido').notEmpty().isString().trim(),
  validarCampos
], async (req, res) => {
  const { nombre } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO materias (nombre) VALUES (?)', [nombre]);
    res.status(201).json({
      ok: true,
      mensaje: 'Materia creada exitosamente',
      materia: { id: result.insertId, nombre }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ ok: false, mensaje: 'Ya existe una materia con ese nombre' });
    }
    res.status(500).json({ ok: false, mensaje: 'Error al crear materia', error: error.message });
  }
});

module.exports = router;