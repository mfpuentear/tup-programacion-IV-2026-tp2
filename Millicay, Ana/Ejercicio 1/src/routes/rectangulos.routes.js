const router = require('express').Router();
const ctrl = require('../controllers/rectangulos.controller');
const v = require('../validators/rectangulos.validator');

router.post('/', v.crear, ctrl.crear);
router.get('/', v.listar, ctrl.listar);
router.get('/:id', v.porId, ctrl.obtener);
router.put('/:id', v.actualizar, ctrl.actualizar);
router.delete('/:id', v.porId, ctrl.eliminar);

module.exports = router;