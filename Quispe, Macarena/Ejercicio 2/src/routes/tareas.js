const express = require('express');
const router = express.Router();

const {
  listarTareas,
  obtenerTarea,
  crearTarea,
  actualizarTarea,
  eliminarTarea
} = require('../controllers/tareasController');

const {
  validateTareaBody,
  validateIdParam,
  validateEstadoQuery
} = require('../validators/tareasValidator');

router.get('/', validateEstadoQuery, listarTareas);
router.get('/:id', validateIdParam, obtenerTarea);
router.post('/', validateTareaBody, crearTarea);
router.put('/:id', validateIdParam, validateTareaBody, actualizarTarea);
router.delete('/:id', validateIdParam, eliminarTarea);

module.exports = router;
