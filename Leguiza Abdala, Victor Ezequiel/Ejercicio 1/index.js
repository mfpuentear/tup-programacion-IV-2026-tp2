import express from 'express';
import rutasRectangulos from './src/routes/rectangulos.routes.js';

const app = express();
const PUERTO = 3000;

app.use(express.json());

app.use('/api/rectangulos', rutasRectangulos);

app.listen(PUERTO, () => {
  console.log(`Servidor activo en http://localhost:${PUERTO}`);
});