const { Router } = require('express');
const controller = require('./materiasController');
const {
  validarNombreMateria,
  validarIdParam,
  manejarErroresDeValidacion,
} = require('./validators');

const router = Router();

router.get('/', controller.listar);

router.get(
  '/:id',
  validarIdParam,
  manejarErroresDeValidacion,
  controller.obtenerPorId
);

router.post(
  '/',
  validarNombreMateria,
  manejarErroresDeValidacion,
  controller.crear
);

router.delete(
  '/:id',
  validarIdParam,
  manejarErroresDeValidacion,
  controller.eliminar
);

module.exports = router;
