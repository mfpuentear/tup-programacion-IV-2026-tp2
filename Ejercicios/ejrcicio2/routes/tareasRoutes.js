const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareasController');
const {
  validateTaskBody,
  validateFilterQuery,
  validateIdParam
} = require('../middlewares/validators');

router.get('/', validateFilterQuery, tareasController.getAll);
router.get('/:id', validateIdParam, tareasController.getById);
router.post('/', validateTaskBody, tareasController.create);
router.put('/:id', validateIdParam, validateTaskBody, tareasController.update);
router.delete('/:id', validateIdParam, tareasController.delete);

module.exports = router;