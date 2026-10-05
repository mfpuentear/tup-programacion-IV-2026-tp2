const express = require('express');
const router = express.Router();
const {
  listarRectangulos,
  obtenerRectangulo,
  crearRectangulo,
  actualizarRectangulo,
  eliminarRectangulo
} = require('../controllers/rectangulosController');

const {
  validateRectanguloBody,
  validateIdParam
} = require('../validators/rectangulosValidator');

router.get('/', listarRectangulos);
router.get('/:id', validateIdParam, obtenerRectangulo);
router.post('/', validateRectanguloBody, crearRectangulo);
router.put('/:id', validateIdParam, validateRectanguloBody, actualizarRectangulo);
router.delete('/:id', validateIdParam, eliminarRectangulo);

module.exports = router;
