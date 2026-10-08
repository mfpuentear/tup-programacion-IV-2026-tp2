const express = require('express');
const app = express();
const rectangleRoutes = require('./routes/rectangle.routes');

app.use(express.json());

// Rutas de la API
app.use('/api/rectangles', rectangleRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});