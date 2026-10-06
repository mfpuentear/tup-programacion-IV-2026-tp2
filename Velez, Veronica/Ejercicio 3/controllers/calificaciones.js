const { Calificacion, Materia } = require('../models/Calificacion');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../database');

// Obtener todas las calificaciones
const getCalificaciones = async (req, res) => {
  try {
    const calificaciones = await Calificacion.findAll({ include: Materia });
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
};

// Crear calificación
const createCalificacion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { alumno, materiaId, notas } = req.body;
  const alumnoNormalizado = alumno.trim().toLowerCase();

  try {
    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ error: 'La materia no existe' });
    }

    const existeRegistro = await Calificacion.findOne({
      where: {
        materiaId,
        [Op.and]: sequelize.where(sequelize.fn('LOWER', sequelize.col('alumno')), alumnoNormalizado)
      }
    });

    if (existeRegistro) {
      return res.status(400).json({ error: 'Ya existe un registro para ese alumno en esta materia' });
    }

    const nuevaCalificacion = await Calificacion.create({
      alumno: alumno.trim(),
      materiaId,
      nota1: notas[0],
      nota2: notas[1],
      nota3: notas[2]
    });

    res.status(201).json(nuevaCalificacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la calificación' });
  }
};

// Modificar calificación
const updateCalificacion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const calificacion = await Calificacion.findByPk(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    const { alumno, materiaId, notas } = req.body;
    let nuevoAlumno = calificacion.alumno;
    let nuevaMateriaId = calificacion.materiaId;

    if (alumno !== undefined) {
      nuevoAlumno = alumno.trim();
    }
    if (materiaId !== undefined) {
      nuevaMateriaId = materiaId;
      const materia = await Materia.findByPk(nuevaMateriaId);
      if (!materia) {
        return res.status(404).json({ error: 'La nueva materia no existe' });
      }
    }

    // Verificar unicidad de alumno - materia
    const existeRegistro = await Calificacion.findOne({
      where: {
        materiaId: nuevaMateriaId,
        [Op.and]: sequelize.where(sequelize.fn('LOWER', sequelize.col('alumno')), nuevoAlumno.toLowerCase()),
        id: { [Op.ne]: calificacion.id }
      }
    });

    if (existeRegistro) {
      return res.status(400).json({ error: 'Ya existe un registro para ese alumno en esa materia' });
    }

    calificacion.alumno = nuevoAlumno;
    calificacion.materiaId = nuevaMateriaId;
    if (notas !== undefined) {
      calificacion.nota1 = notas[0];
      calificacion.nota2 = notas[1];
      calificacion.nota3 = notas[2];
    }

    await calificacion.save();
    res.json(calificacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la calificación' });
  }
};

// Eliminar calificación
const deleteCalificacion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const calificacion = await Calificacion.findByPk(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    await calificacion.destroy();
    res.json({ mensaje: 'Registro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la calificación' });
  }
};

module.exports = {
  getCalificaciones,
  createCalificacion,
  updateCalificacion,
  deleteCalificacion
};
