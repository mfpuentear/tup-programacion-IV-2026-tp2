const { Router } = require('express');
const controller = require('./calificacionesController');
const {
  validarCreacionCalificacion,
  validarModificacionCalificacion,
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
  validarCreacionCalificacion,
  manejarErroresDeValidacion,
  controller.crear
);

router.patch(
  '/:id',
  [...validarIdParam, ...validarModificacionCalificacion],
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
