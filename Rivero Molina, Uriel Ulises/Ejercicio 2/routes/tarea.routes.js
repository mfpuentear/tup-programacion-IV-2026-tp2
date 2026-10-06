const express = require('express');
const router = express.Router();
const controller = require('../controllers/tarea.controller');
const handleValidationErrors = require('../middlewares/validator.middleware');
const {
    validateCreateTarea,
    validateUpdateTarea,
    validateIdParam,
    validateQueryFilter
} = require('../validators/tarea.validator');

router.get('/', validateQueryFilter, handleValidationErrors, controller.getTareas);
router.get('/:id', validateIdParam, handleValidationErrors, controller.getTareaById);
router.post('/', validateCreateTarea, handleValidationErrors, controller.createTarea);
router.put('/:id', validateUpdateTarea, handleValidationErrors, controller.updateTarea);
router.delete('/:id', validateIdParam, handleValidationErrors, controller.deleteTarea);

module.exports = router;
