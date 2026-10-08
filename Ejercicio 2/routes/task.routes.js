const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const {
  createTaskValidation,
  updateTaskValidation,
  getByIdValidation,
  filterQueryValidation
} = require('../validators/task.validator');

router.get('/', filterQueryValidation, taskController.getAllTasks);
router.get('/:id', getByIdValidation, taskController.getTaskById);
router.post('/', createTaskValidation, taskController.createTask);
router.put('/:id', updateTaskValidation, taskController.updateTask);
router.delete('/:id', getByIdValidation, taskController.deleteTask);

module.exports = router;