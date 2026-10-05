const { Router } = require('express');
const c = require('../controllers/calificaciones.controller');
const v = require('../validators/calificaciones.validator');

const router = Router();

router.get('/', v.validarFiltros, c.listar);
router.get('/:id', v.validarId, c.obtener);
router.post('/', v.validarCrear, c.crear);
router.put('/:id', v.validarActualizar, c.actualizar);
router.delete('/:id', v.validarId, c.eliminar);

module.exports = router;
