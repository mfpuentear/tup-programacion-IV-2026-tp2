const express = require('express');
require('dotenv').config();
const rectangulosRoutes = require('./rectangulos');

const app = express();
app.use(express.json());

app.use('/api/rectangulos', rectangulosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor del Ejercicio 1 corriendo en el puerto ${PORT}`);
});