import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { RectanguloModel } from './rectanguloModel.js';

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

const validacionesRectangulo = [
    body('lado1')
        .exists().withMessage('El lado1 es obligatorio.')
        .isFloat({ gt: 0 }).withMessage('El lado1 debe ser un número mayor a 0.'),
    body('lado2')
        .exists().withMessage('El lado2 es obligatorio.')
        .isFloat({ gt: 0 }).withMessage('El lado2 debe ser un número mayor a 0.'),
    validarCampos
];


const validacionId = [
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un número entero positivo.'),
    validarCampos
];

app.get('/rectangulos', async (req, res) => {
    try {
        const rectangulos = await RectanguloModel.getAll();
        res.json(rectangulos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/rectangulos/:id', validacionId, async (req, res) => {
    try {
        const rectangulo = await RectanguloModel.getById(req.params.id);
        if (!rectangulo) return res.status(404).json({ error: "Rectángulo no encontrado." });
        res.json(rectangulo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/rectangulos', validacionesRectangulo, async (req, res) => {
    try {
        const { lado1, lado2 } = req.body;
        const nuevoRectangulo = await RectanguloModel.create(lado1, lado2);
        res.status(201).json(nuevoRectangulo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/rectangulos/:id', [...validacionId, ...validacionesRectangulo], async (req, res) => {
    try {
        const { lado1, lado2 } = req.body;
        const actualizado = await RectanguloModel.update(req.params.id, lado1, lado2);
        if (!actualizado) return res.status(404).json({ error: "Rectángulo no encontrado." });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/rectangulos/:id', validacionId, async (req, res) => {
    try {
        const eliminado = await RectanguloModel.delete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "Rectángulo no encontrado." });
        res.json({ mensaje: "Rectángulo eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Rectángulos corriendo en http://localhost:${PORT}`);
});