const express = require('express');
const router = express.Router();
const calificacionesController = require('../controllers/calificacionesController');
const { validateCalificacion, validateIdParam } = require('../middlewares/validators');

router.get('/', calificacionesController.getAll);
router.get('/:id', validateIdParam, calificacionesController.getById);
router.post('/', validateCalificacion, calificacionesController.create);
router.put('/:id', validateIdParam, validateCalificacion, calificacionesController.update);
router.delete('/:id', validateIdParam, calificacionesController.delete);

module.exports = router;