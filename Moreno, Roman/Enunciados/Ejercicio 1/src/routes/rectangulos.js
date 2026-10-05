const express = require('express');
const router = express.Router();
const rectangulos = require('../controllers/rectangulos');

// Rutas
router.post('/', rectangulos.crear);           // Crear
router.get('/', rectangulos.obtenerTodos);     // Obtener todos
router.get('/:id', rectangulos.obtenerPorId);  // Obtener por ID
router.put('/:id', rectangulos.actualizar);    // Actualizar
router.delete('/:id', rectangulos.eliminar);   // Eliminar

module.exports = router;