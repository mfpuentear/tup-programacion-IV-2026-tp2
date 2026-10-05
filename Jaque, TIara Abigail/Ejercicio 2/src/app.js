const express = require('express');
const tareasRoutes = require('./routes/tareas.route');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use('/api/tareas', tareasRoutes);

app.listen(PORT, () => {
    console.log(`Servidor de Tareas ejecutándose en http://localhost:${PORT}`);
});