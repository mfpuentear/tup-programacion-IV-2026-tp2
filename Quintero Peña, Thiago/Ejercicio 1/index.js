import express from 'express';
import dotenv from 'dotenv';
import rectangulosRouter from './rectangulos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/rectangulos', rectangulosRouter);

app.listen(PORT, () => {
  console.log(`Servidor Ejercicio 1 corriendo en puerto ${PORT}`);
});