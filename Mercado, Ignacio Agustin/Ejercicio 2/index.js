import express from "express";
import { conectarDB } from "./db.js";
import tareasRouter from "./tareas.js";

await conectarDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/tareas", tareasRouter);

app.listen(port, () => {
  console.log(`Servidor de tareas escuchando en http://localhost:${port}`);
});