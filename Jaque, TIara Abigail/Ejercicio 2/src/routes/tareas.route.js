const { Router } = require('express');
const { obtenerTareas, crearTarea, actualizarTarea, eliminarTarea } = require('../controllers/tareas.controller');
const { validarTarea, validarFiltroEstado } = require('../validators/tareas.validator');

const router = Router();

router.get('/', validarFiltroEstado, obtenerTareas);
router.post('/', validarTarea, crearTarea);
router.put('/:id', validarTarea, actualizarTarea);
router.delete('/:id', eliminarTarea);

module.exports = router;