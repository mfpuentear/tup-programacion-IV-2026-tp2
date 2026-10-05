const express = require('express');
const router = express.Router();

const {
  listarAlumnos,
  obtenerAlumno,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno
} = require('../controllers/alumnosController');

const {
  validateAlumnoBody,
  validateIdParam
} = require('../validators/alumnosValidator');

router.get('/', listarAlumnos);
router.get('/:id', validateIdParam, obtenerAlumno);
router.post('/', validateAlumnoBody, crearAlumno);
router.put('/:id', validateIdParam, validateAlumnoBody, actualizarAlumno);
router.delete('/:id', validateIdParam, eliminarAlumno);

module.exports = router;
