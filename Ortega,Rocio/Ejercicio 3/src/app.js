const express = require('express');
const notasRoutes = require('./routes/notas.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de notas funcionando'
    });
});

app.use('/notas', notasRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});