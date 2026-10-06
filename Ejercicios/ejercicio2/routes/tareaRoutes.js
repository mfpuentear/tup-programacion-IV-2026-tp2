const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const {
  validateIdParam,
  validateQueryFilter,
  validateCreateTarea,
  validateUpdateTarea
} = require('../middlewares/tareaValidation');

router.get('/', validateQueryFilter, tareaController.getAll);

router.get('/:id', validateIdParam, tareaController.getById);

router.post('/', validateCreateTarea, tareaController.create);

router.put('/:id', validateUpdateTarea, tareaController.update);

router.delete('/:id', validateIdParam, tareaController.delete);

module.exports = router;