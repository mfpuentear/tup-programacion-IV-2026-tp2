const express = require('express');
const router = express.Router();
const controller = require('../controllers/materia.controller');

router.get('/', controller.getMaterias);

module.exports = router;
