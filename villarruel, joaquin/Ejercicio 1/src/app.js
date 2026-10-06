
const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API de rectángulos funcionando"
    });
});

const rectangulosRoutes = require("./routes/rectangulos.routes");

app.use("/rectangulos", rectangulosRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

