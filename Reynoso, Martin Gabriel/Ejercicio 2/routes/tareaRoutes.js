import express from 'express';
import {
  crearTarea,
  obtenerTareas,
  obtenerTareaPorId,
  actualizarTarea,
  eliminarTarea
} from '../controllers/tareaController.js';
import {
  validateId,
  validateQueryParams,
  validateCrearTareaBody,
  validateActualizarTareaBody
} from '../middlewares/validator.js';

const router = express.Router();

router.post('/', validateCrearTareaBody, crearTarea);
router.get('/', validateQueryParams, obtenerTareas);
router.get('/:id', validateId, obtenerTareaPorId);
router.put('/:id', [...validateId, ...validateActualizarTareaBody], actualizarTarea);
router.delete('/:id', validateId, eliminarTarea);

export default router;