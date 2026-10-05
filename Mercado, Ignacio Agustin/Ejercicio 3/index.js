import express from "express";
import { conectarDB } from "./db.js";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

await conectarDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

app.listen(port, () => {
  console.log(`Servidor de calificaciones escuchando en http://localhost:${port}`);
});