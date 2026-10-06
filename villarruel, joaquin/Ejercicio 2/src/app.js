const express = require('express');

const tareasRoutes = require('./routes/tareas.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de tareas funcionando'
    });
});

app.use('/tareas', tareasRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
