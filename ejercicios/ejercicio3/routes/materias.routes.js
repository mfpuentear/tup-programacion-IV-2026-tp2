const express = require('express');
const router = express.Router();
const controller = require('../controllers/materias.controller');
const validate = require('../middlewares/validate.middleware');
const { crearMateriaValidator } = require('../validators/materias.validator');

router.get('/', controller.obtenerMaterias);
router.post('/', crearMateriaValidator, validate, controller.crearMateria);

module.exports = router;