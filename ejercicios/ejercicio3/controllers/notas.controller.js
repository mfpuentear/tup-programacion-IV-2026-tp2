const NotaModel = require('../models/nota.model');
const MateriaModel = require('../models/materia.model');

exports.obtenerCalificaciones = async (req, res, next) => {
  try {
    const { materia_id } = req.query;
    const calificaciones = await NotaModel.obtenerTodas(materia_id);
    res.json({ status: 'success', data: calificaciones });
  } catch (error) {
    next(error);
  }
};

exports.crearCalificacion = async (req, res, next) => {
  try {
    const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;

      
    const materiaExiste = await MateriaModel.obtenerPorId(materia_id);
    if (!materiaExiste) {
      return res.status(404).json({ status: 'fail', message: 'La materia especificada no existe' });
    }

    
    const existeRegistro = await NotaModel.buscarExistente(alumno_nombre, materia_id);
    if (existeRegistro) {
      return res.status(409).json({
        status: 'fail',
        message: 'Ya existe un registro de calificaciones registrado para este alumno en la materia seleccionada'
      });
    }

    const newId = await NotaModel.crear({ alumno_nombre, materia_id, nota1, nota2, nota3 });
    const registroCreado = await NotaModel.obtenerPorId(newId);

    res.status(201).json({ status: 'success', data: registroCreado });
  } catch (error) {
    next(error);
  }
};

exports.actualizarCalificacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { alumno_nombre, materia_id, nota1, nota2, nota3 } = req.body;

    
    const registroExistente = await NotaModel.obtenerPorId(id);
    if (!registroExistente) {
      return res.status(404).json({ status: 'fail', message: 'El registro de calificación a actualizar no existe' });
    }

    
    const materiaExiste = await MateriaModel.obtenerPorId(materia_id);
    if (!materiaExiste) {
      return res.status(404).json({ status: 'fail', message: 'La materia especificada no existe' });
    }

    
    const existeDuplicado = await NotaModel.buscarExistente(alumno_nombre, materia_id, id);
    if (existeDuplicado) {
      return res.status(409).json({
        status: 'fail',
        message: 'La actualización genera conflicto con otro registro existente para el mismo alumno y materia'
      });
    }

    await NotaModel.actualizar(id, { alumno_nombre, materia_id, nota1, nota2, nota3 });
    const registroActualizado = await NotaModel.obtenerPorId(id);

    res.json({ status: 'success', data: registroActualizado });
  } catch (error) {
    next(error);
  }
};

exports.eliminarCalificacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eliminado = await NotaModel.eliminar(id);
    
    if (!eliminado) {
      return res.status(404).json({ status: 'fail', message: 'Registro no encontrado' });
    }

    res.json({ status: 'success', message: 'Registro de calificación eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
}