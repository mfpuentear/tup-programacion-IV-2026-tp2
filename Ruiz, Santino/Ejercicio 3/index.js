import express from "express";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(port, () => {
  console.log(`Servidor de Calificaciones ejecutándose en http://localhost:${port}`);
});