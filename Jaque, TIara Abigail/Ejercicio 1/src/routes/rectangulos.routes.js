const { Router } = require('express');
const { obtenerTodos, crear, actualizar, eliminar } = require('../controllers/rectangulos.controllers.js');
const { validarRectangulo } = require('../validators/rectangulos.validators.js');

const router = Router();

// 1. Consultar todos los rectángulos
router.get('/', obtenerTodos);

// 2. Crear un rectángulo (interviene express-validator)
router.post('/', validarRectangulo, crear);

// 3. Modificar un rectángulo (interviene express-validator)
router.put('/:id', validarRectangulo, actualizar);

// 4. Eliminar un rectángulo
router.delete('/:id', eliminar);

module.exports = router;