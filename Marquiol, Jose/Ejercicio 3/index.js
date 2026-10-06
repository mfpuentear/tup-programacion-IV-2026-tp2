import express from 'express';
import alumnoRouter from './alumno.js';
import materiaRouter from './materia.js';
import notaRouter from './nota.js';

const app = express();

app.use(express.json());

app.use('/alumnos', alumnoRouter);
app.use('/materias', materiaRouter);
app.use('/notas', notaRouter);

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});