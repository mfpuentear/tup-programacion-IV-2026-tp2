const express = require('express');
const rectangulosRoutes = require('./routes/rectangulos.routes.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/rectangulo', rectangulosRoutes);
app.use('/api/rectangulos', rectangulosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});