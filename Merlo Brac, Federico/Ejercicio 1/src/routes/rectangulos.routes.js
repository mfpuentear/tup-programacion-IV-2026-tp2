import { Router } from 'express';
import {
  getAllRectangles,
  getRectangleById,
  createRectangle,
  updateRectangle,
  deleteRectangle
} from '../controllers/rectangulos.controller.js';
import {
  createRectangleValidator,
  updateRectangleValidator,
  idParamValidator,
  queryRectangleValidator
} from '../validators/rectangulos.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

// GET /api/rectangulos - Listar todos los rectángulos (soporta filtros opcionales)
router.get('/', queryRectangleValidator, validateRequest, getAllRectangles);

// GET /api/rectangulos/:id - Obtener un rectángulo por ID
router.get('/:id', idParamValidator, validateRequest, getRectangleById);

// POST /api/rectangulos - Crear nuevo rectángulo (solo lados en el body)
router.post('/', createRectangleValidator, validateRequest, createRectangle);

// PUT /api/rectangulos/:id - Modificar un rectángulo (solo lados en el body)
router.put('/:id', updateRectangleValidator, validateRequest, updateRectangle);

// DELETE /api/rectangulos/:id - Eliminar un rectángulo
router.delete('/:id', idParamValidator, validateRequest, deleteRectangle);

export default router;
