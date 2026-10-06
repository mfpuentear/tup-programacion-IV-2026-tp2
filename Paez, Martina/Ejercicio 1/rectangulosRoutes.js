const { Router } = require('express');
const controller = require('./rectangulosController');
const {
  validarLados,
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
  validarLados,
  manejarErroresDeValidacion,
  controller.crear
);

router.put(
  '/:id',
  [...validarIdParam, ...validarLados],
  manejarErroresDeValidacion,
  controller.modificar
);

router.delete(
  '/:id',
  validarIdParam,
  manejarErroresDeValidacion,
  controller.eliminar
);

module.exports = router;
