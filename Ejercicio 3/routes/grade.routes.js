const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { validateCreateGrade, validateUpdateGrade, validateIdParam } = require('../validators/grade.validator');

// Ruta para obtener materias
router.get('/subjects', gradeController.getSubjects);

// Rutas CRUD de Calificaciones
router.get('/grades', gradeController.getAllGrades);
router.get('/grades/:id', validateIdParam, gradeController.getGradeById);
router.post('/grades', validateCreateGrade, gradeController.createGrade);
router.put('/grades/:id', validateUpdateGrade, gradeController.updateGrade);
router.delete('/grades/:id', validateIdParam, gradeController.deleteGrade);

module.exports = router;