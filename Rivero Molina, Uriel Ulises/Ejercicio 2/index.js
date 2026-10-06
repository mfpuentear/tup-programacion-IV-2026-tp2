const express = require('express');
require('dotenv').config();

const tareaRoutes = require('./routes/tarea.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/tareas', tareaRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
