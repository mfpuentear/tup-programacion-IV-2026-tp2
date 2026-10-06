const express = require('express');
const router = express.Router();
const rectanguloController = require('../controllers/rectanguloController');
const {
  validateCreateRectangulo,
  validateUpdateRectangulo,
  validateIdParam,
  validateQueryOptions
} = require('../middlewares/rectanguloValidators');

router.get('/', validateQueryOptions, rectanguloController.getRectangulos);
router.get('/:id', validateIdParam, rectanguloController.getRectanguloById);
router.post('/', validateCreateRectangulo, rectanguloController.createRectangulo);
router.put('/:id', validateUpdateRectangulo, rectanguloController.updateRectangulo);
router.delete('/:id', validateIdParam, rectanguloController.deleteRectangulo);

module.exports = router;