import express from 'express';
import dotenv from 'dotenv';
import productosRouter from './productos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Montar el router de productos
app.use('/api/productos', productosRouter);

app.listen(PORT, () => {
  console.log(`Servidor Ejercicio 2 corriendo en puerto ${PORT}`);
});