const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const { validateMateriaId, validateMateriaBody } = require('../middlewares/materiaValidation');

router.get('/', materiaController.getAll);

router.get('/:id', validateMateriaId, materiaController.getById);

router.post('/', validateMateriaBody, materiaController.create);

router.delete('/:id', validateMateriaId, materiaController.delete);

module.exports = router;