import express from "express";
import { conectarDB } from "./db.js";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

await conectarDB();
const app = express();
app.use(express.json());

app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));
