const express = require('express');

const router = express.Router();

const rectanguloController = require('../controllers/rectanguloController');


// Obtener todos
router.get(
    '/rectangulos',
    rectanguloController.obtenerTodos
);


// Obtener uno
router.get(
    '/rectangulos/:id',
    rectanguloController.obtenerUno
);


// Crear
router.post(
    '/rectangulos',
    rectanguloController.crear
);


// Modificar
router.put(
    '/rectangulos/:id',
    rectanguloController.modificar
);


// Eliminar
router.delete(
    '/rectangulos/:id',
    rectanguloController.eliminar
);


module.exports = router;