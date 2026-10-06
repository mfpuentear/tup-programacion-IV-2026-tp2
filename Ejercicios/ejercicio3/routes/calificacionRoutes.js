const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacionController');
const {
  validateIdParam,
  validateQueryFilter,
  validateCreateCalificacion,
  validateUpdateCalificacion
} = require('../middlewares/calificacionValidation');

router.get('/', validateQueryFilter, calificacionController.getAll);

router.get('/:id', validateIdParam, calificacionController.getById);

router.post('/', validateCreateCalificacion, calificacionController.create);

router.put('/:id', validateUpdateCalificacion, calificacionController.update);

router.delete('/:id', validateIdParam, calificacionController.delete);

module.exports = router;