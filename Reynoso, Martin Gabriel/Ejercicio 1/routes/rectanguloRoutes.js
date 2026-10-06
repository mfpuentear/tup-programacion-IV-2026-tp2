import express from 'express';
import {
  crearRectangulo,
  obtenerRectangulos,
  obtenerRectanguloPorId,
  actualizarRectangulo,
  eliminarRectangulo
} from '../controllers/rectanguloController.js';
import {
  validateId,
  validateQueryParams,
  validateRectanguloBody
} from '../middlewares/validator.js';

const router = express.Router();

router.post('/', validateRectanguloBody, crearRectangulo);
router.get('/', validateQueryParams, obtenerRectangulos);
router.get('/:id', validateId, obtenerRectanguloPorId);
router.put('/:id', [...validateId, ...validateRectanguloBody], actualizarRectangulo);
router.delete('/:id', validateId, eliminarRectangulo);

export default router;