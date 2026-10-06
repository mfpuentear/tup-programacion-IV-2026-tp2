const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskIdParam,
  validateGetTasksQuery
} = require('../middlewares/taskValidators');

router.get('/', validateGetTasksQuery, taskController.getTasks);
router.get('/:id', validateTaskIdParam, taskController.getTaskById);
router.post('/', validateCreateTask, taskController.createTask);
router.put('/:id', validateUpdateTask, taskController.updateTask);
router.delete('/:id', validateTaskIdParam, taskController.deleteTask);

module.exports = router;