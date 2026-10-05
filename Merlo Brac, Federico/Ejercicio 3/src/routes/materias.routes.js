import { Router } from 'express';
import {
  getAllMaterias,
  getMateriaById,
  createMateria
} from '../controllers/materias.controller.js';
import {
  createMateriaValidator,
  materiaIdParamValidator
} from '../validators/materias.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

// GET /api/materias - Listar todas las materias
router.get('/', getAllMaterias);

// GET /api/materias/:id - Obtener una materia por ID
router.get('/:id', materiaIdParamValidator, validateRequest, getMateriaById);

// POST /api/materias - Crear una nueva materia
router.post('/', createMateriaValidator, validateRequest, createMateria);

export default router;
