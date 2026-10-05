const { Router } = require('express');
const { obtenerCalificaciones, crearCalificacion } = require('../controllers/calificaciones.controller');
const { validarCalificacion } = require('../validators/calificaciones.validator');

const router = Router();

router.get('/', obtenerCalificaciones);
router.post('/', validarCalificacion, crearCalificacion);

module.exports = router;