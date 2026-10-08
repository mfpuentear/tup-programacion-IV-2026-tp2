const express = require('express');
const router = express.Router();
const controller = require('../controllers/rectangle.controller');
const { validateRectangleBody, validateIdParam } = require('../validators/rectangle.validator');

router.get('/', controller.getAllRectangles);
router.get('/:id', validateIdParam, controller.getRectangleById);
router.post('/', validateRectangleBody, controller.createRectangle);
router.put('/:id', [...validateIdParam, ...validateRectangleBody], controller.updateRectangle);
router.delete('/:id', validateIdParam, controller.deleteRectangle);

module.exports = router;