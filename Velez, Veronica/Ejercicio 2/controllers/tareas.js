const Tarea = require('../models/Tarea');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../database');

const getTareas = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { estado } = req.query;
  const where = {};
  
  if (estado !== undefined) {
    where.completada = estado === 'completada' ? true : false;
  }

  try {
    const tareas = await Tarea.findAll({ where });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
};

const createTarea = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, completada } = req.body;
  const nombreNormalizado = nombre.trim().toLowerCase();

  try {
    // Validar unicidad (criterio: trim y toLowerCase)
    const tareaExistente = await Tarea.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nombre')),
        nombreNormalizado
      )
    });

    if (tareaExistente) {
      return res.status(400).json({ error: 'Ya existe una tarea con el mismo nombre' });
    }

    const nuevaTarea = await Tarea.create({
      nombre: nombre.trim(),
      completada: completada || false
    });

    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
};

const updateTarea = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const { nombre, completada } = req.body;

    if (nombre !== undefined) {
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      const tareaExistente = await Tarea.findOne({
        where: {
          [Op.and]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('nombre')), nombreNormalizado),
            { id: { [Op.ne]: tarea.id } }
          ]
        }
      });

      if (tareaExistente) {
        return res.status(400).json({ error: 'Ya existe otra tarea con el mismo nombre' });
      }

      tarea.nombre = nombre.trim();
    }

    if (completada !== undefined) {
      tarea.completada = completada;
    }

    await tarea.save();
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
};

const deleteTarea = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    await tarea.destroy();
    res.json({ mensaje: 'Tarea eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
};

module.exports = {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea
};
