import express from 'express';
import {
  crearCalificacion,
  obtenerCalificaciones,
  obtenerCalificacionPorId,
  actualizarCalificacion,
  eliminarCalificacion
} from '../controllers/alumnoMateriaController.js';
import {
  validateId,
  validateCrearAlumnoMateriaBody,
  validateActualizarAlumnoMateriaBody
} from '../middlewares/validator.js';

const router = express.Router();

router.post('/', validateCrearAlumnoMateriaBody, crearCalificacion);
router.get('/', obtenerCalificaciones);
router.get('/:id', validateId, obtenerCalificacionPorId);
router.put('/:id', [...validateId, ...validateActualizarAlumnoMateriaBody], actualizarCalificacion);
router.delete('/:id', validateId, eliminarCalificacion);

export default router;