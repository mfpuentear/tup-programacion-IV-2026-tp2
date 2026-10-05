const express = require('express');
const router = express.Router();

const {
  listarMaterias,
  obtenerMateria,
  crearMateria,
  actualizarMateria,
  eliminarMateria
} = require('../controllers/materiasController');

const {
  validateMateriaBody,
  validateIdParam
} = require('../validators/materiasValidator');

router.get('/', listarMaterias);
router.get('/:id', validateIdParam, obtenerMateria);
router.post('/', validateMateriaBody, crearMateria);
router.put('/:id', validateIdParam, validateMateriaBody, actualizarMateria);
router.delete('/:id', validateIdParam, eliminarMateria);

module.exports = router;
