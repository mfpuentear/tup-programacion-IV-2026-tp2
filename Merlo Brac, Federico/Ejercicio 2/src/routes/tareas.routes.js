import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTaskStatus,
  deleteTask
} from '../controllers/tareas.controller.js';
import {
  createTaskValidator,
  updateTaskValidator,
  patchTaskStatusValidator,
  idParamValidator,
  queryTaskValidator
} from '../validators/tareas.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

// GET /api/tareas - Listar tareas con soporte para filtro ?estado=completadas|pendientes
router.get('/', queryTaskValidator, validateRequest, getAllTasks);

// GET /api/tareas/:id - Obtener una tarea por ID
router.get('/:id', idParamValidator, validateRequest, getTaskById);

// POST /api/tareas - Crear una nueva tarea (con control de unicidad de nombre)
router.post('/', createTaskValidator, validateRequest, createTask);

// PUT /api/tareas/:id - Modificar nombre y estado de una tarea
router.put('/:id', updateTaskValidator, validateRequest, updateTask);

// PATCH /api/tareas/:id/estado - Modificar únicamente el estado
router.patch('/:id/estado', patchTaskStatusValidator, validateRequest, patchTaskStatus);

// DELETE /api/tareas/:id - Eliminar una tarea
router.delete('/:id', idParamValidator, validateRequest, deleteTask);

export default router;
