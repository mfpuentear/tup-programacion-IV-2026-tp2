const express = require('express');
const router = express.Router();

const {
  listarCalificaciones,
  obtenerCalificacion,
  crearCalificacion,
  actualizarCalificacion,
  eliminarCalificacion
} = require('../controllers/calificacionesController');

const {
  validateCalificacionBody,
  validateIdParam
} = require('../validators/calificacionesValidator');

router.get('/', listarCalificaciones);
router.get('/:id', validateIdParam, obtenerCalificacion);
router.post('/', validateCalificacionBody, crearCalificacion);
router.put('/:id', validateIdParam, validateCalificacionBody, actualizarCalificacion);
router.delete('/:id', validateIdParam, eliminarCalificacion);

module.exports = router;
