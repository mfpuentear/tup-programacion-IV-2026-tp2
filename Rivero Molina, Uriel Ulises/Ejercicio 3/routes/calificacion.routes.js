const express = require('express');
const router = express.Router();
const controller = require('../controllers/calificacion.controller');
const handleValidationErrors = require('../middlewares/validator.middleware');
const {
    validateCreateCalificacion,
    validateUpdateCalificacion,
    validateIdParam,
    validateQueryFilter
} = require('../validators/calificacion.validator');

router.get('/', validateQueryFilter, handleValidationErrors, controller.getCalificaciones);
router.get('/:id', validateIdParam, handleValidationErrors, controller.getCalificacionById);
router.post('/', validateCreateCalificacion, handleValidationErrors, controller.createCalificacion);
router.put('/:id', validateUpdateCalificacion, handleValidationErrors, controller.updateCalificacion);
router.delete('/:id', validateIdParam, handleValidationErrors, controller.deleteCalificacion);

module.exports = router;
