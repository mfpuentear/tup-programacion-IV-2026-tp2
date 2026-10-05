import express from 'express';
import rutasTareas from './src/routes/tareas.routes.js';

const app = express();
const PUERTO = 3000;

app.use(express.json());

app.use('/api/tareas', rutasTareas);

app.listen(PUERTO, () => {
  console.log(`Servidor de tareas activo en http://localhost:${PUERTO}`);
});