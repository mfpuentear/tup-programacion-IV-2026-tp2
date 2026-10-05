import express from "express";
import { conectarDB } from "./db.js";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

conectarDB();

const app = express();
const port = 3003;

// Para interpretar body como JSON
app.use(express.json());

app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`);
});