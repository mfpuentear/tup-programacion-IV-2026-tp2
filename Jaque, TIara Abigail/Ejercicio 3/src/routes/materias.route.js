const { Router } = require('express');
const { obtenerMaterias, crearMateria } = require('../controllers/materias.controller');
const { validarMateria } = require('../validators/materias.validator');

const router = Router();

router.get('/', obtenerMaterias);
router.post('/', validarMateria, crearMateria);

module.exports = router;