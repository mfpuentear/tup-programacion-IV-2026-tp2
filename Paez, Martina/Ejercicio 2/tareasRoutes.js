const { Router } = require('express');
const controller = require('./tareasController');
const {
  validarNombreCreacion,
  validarNombreModificacion,
  validarIdParam,
  validarFiltroCompletada,
  manejarErroresDeValidacion,
} = require('./validators');

const router = Router();

router.get(
  '/',
  validarFiltroCompletada,
  manejarErroresDeValidacion,
  controller.listar
);

router.get(
  '/:id',
  validarIdParam,
  manejarErroresDeValidacion,
  controller.obtenerPorId
);

router.post(
  '/',
  validarNombreCreacion,
  manejarErroresDeValidacion,
  controller.crear
);

// PATCH (no PUT): nombre y completada son ambos opcionales, se permite
// modificar solo uno de los dos sin reenviar el recurso completo.
router.patch(
  '/:id',
  [...validarIdParam, ...validarNombreModificacion],
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
