import express from 'express';
import { crearMateria, obtenerMaterias } from '../controllers/materiaController.js';
import { validateMateriaBody } from '../middlewares/validator.js';

const router = express.Router();

router.post('/', validateMateriaBody, crearMateria);
router.get('/', obtenerMaterias);

export default router;