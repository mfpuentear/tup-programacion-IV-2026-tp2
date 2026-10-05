const { Router } = require('express');
const c = require('../controllers/materias.controller');
const v = require('../validators/materias.validator');

const router = Router();

router.get('/', c.listar);
router.get('/:id', v.validarId, c.obtener);
router.post('/', v.validarCuerpo, c.crear);
router.put('/:id', v.validarIdYCuerpo, c.actualizar);
router.delete('/:id', v.validarId, c.eliminar);

module.exports = router;
