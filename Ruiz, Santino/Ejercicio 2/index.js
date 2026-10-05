import express from "express";
import tareasRouter from "./tareas.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/tareas", tareasRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(port, () => {
  console.log(`La aplicación está funcionando en http://localhost:${port}`);
});