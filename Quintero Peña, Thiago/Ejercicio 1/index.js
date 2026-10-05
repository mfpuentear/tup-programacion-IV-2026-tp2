const express = require('express');
require('dotenv').config();

const rectangulosRouter = require('./rectangulos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/rectangulos', rectangulosRouter);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
