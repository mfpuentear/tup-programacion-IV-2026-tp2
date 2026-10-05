import express from "express";
import { conectarDB } from "./db.js";
import alumnosRouter from "./alumnos.js";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

await conectarDB();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Para interpretar body como JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de calificaciones");
});

app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
