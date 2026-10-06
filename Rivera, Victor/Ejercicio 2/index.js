import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { TareaModel } from './tareaModel.js';

const app = express();
const PORT = 3000;

app.use(express.json());

const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

const validacionBody = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre de la tarea es obligatorio.'),
    body('completada')
        .optional()
        .isBoolean().withMessage('El campo completada debe ser un valor booleano (true o false).'),
    validarCampos
];

const validacionId = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo.'),
    validarCampos
];

app.get('/tareas', [
    query('completada')
        .optional()
        .isBoolean().withMessage('El filtro completada debe ser true o false.'),
    validarCampos
], async (req, res) => {
    try {
        let filtro = null;
        if (req.query.completada !== undefined) {
            filtro = req.query.completada === 'true';
        }

        const tareas = await TareaModel.getAll(filtro);
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/tareas/:id', validacionId, async (req, res) => {
    try {
        const tarea = await TareaModel.getById(req.params.id);
        if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada.' });
        res.json(tarea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/tareas', validacionBody, async (req, res) => {
    try {
        const { nombre, completada = false } = req.body;

        const existe = await TareaModel.findByNombre(nombre);
        if (existe) {
            return res.status(400).json({ error: 'Ya existe una tarea con ese mismo nombre.' });
        }

        const nuevaTarea = await TareaModel.create(nombre, completada);
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/tareas/:id', [...validacionId, ...validacionBody], async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, completada = false } = req.body;

        const existe = await TareaModel.findByNombre(nombre, id);
        if (existe) {
            return res.status(400).json({ error: 'Ya existe otra tarea con ese mismo nombre.' });
        }

        const actualizada = await TareaModel.update(id, nombre, completada);
        if (!actualizada) return res.status(404).json({ error: 'Tarea no encontrada.' });

        res.json(actualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/tareas/:id', validacionId, async (req, res) => {
    try {
        const eliminada = await TareaModel.delete(req.params.id);
        if (!eliminada) return res.status(404).json({ error: 'Tarea no encontrada.' });
        res.json({ mensaje: 'Tarea eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Tareas corriendo en http://localhost:${PORT}`);
});