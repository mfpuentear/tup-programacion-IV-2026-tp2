const { validationResult, body, param, query } = require('express-validator');
const Rectangulo = require('../models/Rectangulo');

// Validaciones
const validarRectangulo = [
  body('lado1')
    .notEmpty().withMessage('lado1 es requerido')
    .isFloat({ min: 0.01 }).withMessage('lado1 debe ser un número mayor que cero'),
  body('lado2')
    .notEmpty().withMessage('lado2 es requerido')
    .isFloat({ min: 0.01 }).withMessage('lado2 debe ser un número mayor que cero')
];

const validarId = [
  param('id')
    .isInt({ min: 1 }).withMessage('id debe ser un número entero positivo')
];

// Crear un rectángulo
exports.crear = [
  ...validarRectangulo,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { lado1, lado2 } = req.body;
      const result = await Rectangulo.crear(lado1, lado2);
      res.status(201).json({
        mensaje: 'Rectángulo creado exitosamente',
        id: result.insertId,
        lado1,
        lado2,
        perimetro: 2 * (lado1 + lado2),
        superficie: lado1 * lado2
      });
    } catch (error) {
  console.error('ERROR AL CREAR RECTANGULO:', error);
  return res.status(500).json({
    error: 'Error al crear rectángulo',
    detalle: error.message || 'Sin detalle',
    stack: error.stack
  });
}
  }
];

// Obtener todos los rectángulos
exports.obtenerTodos = async (req, res) => {
  try {
    const rectangulos = await Rectangulo.obtenerTodos();
    res.status(200).json(rectangulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener rectángulos', detalle: error.message });
  }
};

// Obtener un rectángulo por ID
exports.obtenerPorId = [
  ...validarId,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const rectangulo = await Rectangulo.obtenerPorId(id);
      
      if (!rectangulo) {
        return res.status(404).json({ error: 'Rectángulo no encontrado' });
      }
      
      res.status(200).json(rectangulo);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener rectángulo', detalle: error.message });
    }
  }
];

// Actualizar un rectángulo
exports.actualizar = [
  ...validarId,
  ...validarRectangulo,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { lado1, lado2 } = req.body;
      
      const existe = await Rectangulo.obtenerPorId(id);
      if (!existe) {
        return res.status(404).json({ error: 'Rectángulo no encontrado' });
      }
      
      await Rectangulo.actualizar(id, lado1, lado2);
      res.status(200).json({
        mensaje: 'Rectángulo actualizado exitosamente',
        id,
        lado1,
        lado2,
        perimetro: 2 * (lado1 + lado2),
        superficie: lado1 * lado2
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar rectángulo', detalle: error.message });
    }
  }
];

// Eliminar un rectángulo
exports.eliminar = [
  ...validarId,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      
      const existe = await Rectangulo.obtenerPorId(id);
      if (!existe) {
        return res.status(404).json({ error: 'Rectángulo no encontrado' });
      }
      
      await Rectangulo.eliminar(id);
      res.status(200).json({ mensaje: 'Rectángulo eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar rectángulo', detalle: error.message });
    }
  }
];