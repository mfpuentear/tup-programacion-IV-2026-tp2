const express = require('express');
const router = express.Router();
const controller = require('../controllers/rectangulo.controller');
const handleValidationErrors = require('../middlewares/validator.middleware');
const {
    validateRectangleBody,
    validateIdParam,
    validateQueryParams
} = require('../validators/rectangulo.validator');

router.get(
    '/',
    validateQueryParams,
    handleValidationErrors,
    controller.getAllRectangulos
);

router.get(
    '/:id',
    validateIdParam,
    handleValidationErrors,
    controller.getRectanguloById
);

router.post(
    '/',
    validateRectangleBody,
    handleValidationErrors,
    controller.createRectangulo
);

router.put(
    '/:id',
    validateIdParam,
    validateRectangleBody,
    handleValidationErrors,
    controller.updateRectangulo
);

router.delete(
    '/:id',
    validateIdParam,
    handleValidationErrors,
    controller.deleteRectangulo
);

module.exports = router;