const express = require('express');
const rectangulosRouter = require('./routes/rectangulos.routes');

const app = express();

app.use(express.json());

app.use('/rectangulos', rectangulosRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});