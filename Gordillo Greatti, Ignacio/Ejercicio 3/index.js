import express from "express";
import materiasRouter from "./materias.js";
import alumnosRouter from "./alumnos.js";
import calificacionesRouter from "./calificaciones.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/materias", materiasRouter);
app.use("/alumnos", alumnosRouter);
app.use("/calificaciones", calificacionesRouter);

app.listen(port, () => {
    console.log(`API de calificaciones en http://localhost:${port}`);
});