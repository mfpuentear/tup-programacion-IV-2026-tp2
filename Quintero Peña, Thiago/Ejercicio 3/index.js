import express from 'express';
import dotenv from 'dotenv';
import materiasRouter from './materias.js';
import calificacionesRouter from './calificaciones.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/materias', materiasRouter);
app.use('/api/calificaciones', calificacionesRouter);

app.listen(PORT, () => {
  console.log(`Servidor Ejercicio 3 corriendo en puerto ${PORT}`);
});