import { Router } from 'express';
import {
  getAllCalificaciones,
  getCalificacionById,
  createCalificacion,
  updateCalificacion,
  deleteCalificacion
} from '../controllers/calificaciones.controller.js';
import {
  createCalificacionValidator,
  updateCalificacionValidator,
  idParamValidator,
  queryCalificacionValidator
} from '../validators/calificaciones.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

// GET /api/calificaciones - Listar calificaciones con filtros ?materia_id=... o ?alumno=...
router.get('/', queryCalificacionValidator, validateRequest, getAllCalificaciones);

// GET /api/calificaciones/:id - Obtener una calificación por ID
router.get('/:id', idParamValidator, validateRequest, getCalificacionById);

// POST /api/calificaciones - Crear una nueva calificación (valida existencia de materia, notas y unicidad)
router.post('/', createCalificacionValidator, validateRequest, createCalificacion);

// PUT /api/calificaciones/:id - Modificar una calificación (valida existencia de materia, notas y unicidad)
router.put('/:id', updateCalificacionValidator, validateRequest, updateCalificacion);

// DELETE /api/calificaciones/:id - Eliminar una calificación
router.delete('/:id', idParamValidator, validateRequest, deleteCalificacion);

export default router;
