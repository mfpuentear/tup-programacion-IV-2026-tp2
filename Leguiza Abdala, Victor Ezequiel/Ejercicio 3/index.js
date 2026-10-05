import express from 'express';
import rutasCalificaciones from './src/routes/calificaciones.routes.js';

const app = express();
const PUERTO = 3000;

app.use(express.json());
app.use('/api/calificaciones', rutasCalificaciones);

app.listen(PUERTO, () => {
  console.log(`Servidor de calificaciones activo en http://localhost:${PUERTO}`);
});