const Rectangulo = require('../models/Rectangulo');
const { validationResult } = require('express-validator');

// Obtener todos los rectángulos
const getRectangulos = async (req, res) => {
  try {
    const rectangulos = await Rectangulo.findAll();
    res.json(rectangulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los rectángulos' });
  }
};

// Obtener un rectángulo por ID
const getRectanguloById = async (req, res) => {
  try {
    const rectangulo = await Rectangulo.findByPk(req.params.id);
    if (rectangulo) {
      res.json(rectangulo);
    } else {
      res.status(404).json({ error: 'Rectángulo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el rectángulo' });
  }
};

// Crear un rectángulo
const createRectangulo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // La consigna indica que el perimetro y superficie no deben aceptarse del cliente,
  // sino calcularse en el servidor.
  const { lado1, lado2 } = req.body;
  const perimetro = 2 * (lado1 + lado2);
  const superficie = lado1 * lado2;

  try {
    const nuevoRectangulo = await Rectangulo.create({
      lado1,
      lado2,
      perimetro,
      superficie
    });
    res.status(201).json(nuevoRectangulo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el rectángulo' });
  }
};

// Modificar un rectángulo
const updateRectangulo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const rectangulo = await Rectangulo.findByPk(req.params.id);
    if (!rectangulo) {
      return res.status(404).json({ error: 'Rectángulo no encontrado' });
    }

    const { lado1, lado2 } = req.body;
    const perimetro = 2 * (lado1 + lado2);
    const superficie = lado1 * lado2;

    await rectangulo.update({
      lado1,
      lado2,
      perimetro,
      superficie
    });

    res.json(rectangulo);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el rectángulo' });
  }
};

// Eliminar un rectángulo
const deleteRectangulo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const rectangulo = await Rectangulo.findByPk(req.params.id);
    if (!rectangulo) {
      return res.status(404).json({ error: 'Rectángulo no encontrado' });
    }

    await rectangulo.destroy();
    res.json({ mensaje: 'Rectángulo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el rectángulo' });
  }
};

module.exports = {
  getRectangulos,
  getRectanguloById,
  createRectangulo,
  updateRectangulo,
  deleteRectangulo
};
