require('dotenv').config();

const express = require('express');
const tareaRoutes = require('./routes/tareaRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/', tareaRoutes);

app.listen(PORT, () => {
    console.log(`API corriendo en: http://localhost:${PORT}`);
});