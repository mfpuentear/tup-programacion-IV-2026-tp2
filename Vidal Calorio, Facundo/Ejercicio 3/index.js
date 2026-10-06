import express from "express";
import { conectarDB } from "./db.js";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

await conectarDB();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de calificaciones");
});

app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

app.listen(PORT, () => {
    console.log(`API funcionando en http://localhost:${PORT}`);
});