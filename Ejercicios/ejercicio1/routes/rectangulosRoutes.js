const express = require('express');
const router = express.Router();
const rectangulosController = require('../controllers/rectangulosController');
const { validateRectangleBody, validateIdParam } = require('../middlewares/validators');

router.get('/', rectangulosController.getAll);
router.get('/:id', validateIdParam, rectangulosController.getById);
router.post('/', validateRectangleBody, rectangulosController.create);
router.put('/:id', validateIdParam, validateRectangleBody, rectangulosController.update);
router.delete('/:id', validateIdParam, rectangulosController.delete);

module.exports = router;