const MateriaModel = require('../models/materia.model');

exports.obtenerMaterias = async (req, res, next) => {
  try {
    const materias = await MateriaModel.obtenerTodas();
    res.json({ status: 'success', data: materias });
  } catch (error) {
    next(error);
  }
};

exports.crearMateria = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const newId = await MateriaModel.crear(nombre.trim());
    const nuevaMateria = await MateriaModel.obtenerPorId(newId);
    
    res.status(201).json({ status: 'success', data: nuevaMateria });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'fail', message: 'La materia ya se encuentra registrada' });
    }
    next(error);
  }
};