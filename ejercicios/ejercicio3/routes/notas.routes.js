const express = require('express');
const router = express.Router();
const controller = require('../controllers/notas.controller');
const validate = require('../middlewares/validate.middleware');
const { 
  crearCalificacionValidator, 
  actualizarCalificacionValidator,
  consultaFiltroValidator
} = require('../validators/notas.validator');
const { idParamValidator } = require('../validators/materias.validator');

router.get('/', consultaFiltroValidator, validate, controller.obtenerCalificaciones);
router.post('/', crearCalificacionValidator, validate, controller.crearCalificacion);
router.put('/:id', actualizarCalificacionValidator, validate, controller.actualizarCalificacion);
router.delete('/:id', idParamValidator, validate, controller.eliminarCalificacion);

module.exports = router;