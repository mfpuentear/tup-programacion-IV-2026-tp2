const express = require('express');
const router = express.Router();
const rectanguloController = require('../controllers/rectanguloController');
const { validateIdParam, validateRectanguloBody } = require('../middlewares/rectanguloValidation');

router.get('/', rectanguloController.getAll);

router.get('/:id', validateIdParam, rectanguloController.getById);

router.post('/', validateRectanguloBody, rectanguloController.create);

router.put('/:id', [...validateIdParam, ...validateRectanguloBody], rectanguloController.update);

router.delete('/:id', validateIdParam, rectanguloController.delete);

module.exports = router;