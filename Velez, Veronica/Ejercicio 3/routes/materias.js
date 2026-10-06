const { Router } = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const Materia = require('../models/Materia');

const router = Router();

router.get('/', async (req, res) => {
  const materias = await Materia.findAll();
  res.json(materias);
});

router.post('/', 
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const materia = await Materia.create({ nombre: req.body.nombre });
      res.status(201).json(materia);
    } catch (e) {
      res.status(500).json({ error: 'Error al crear materia' });
    }
});

module.exports = router;
