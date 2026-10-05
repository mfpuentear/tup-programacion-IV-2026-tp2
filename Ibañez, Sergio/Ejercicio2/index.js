import express from "express";
import { conectarDB } from "./db.js";
import tareasRouter from "./tareas.js";

conectarDB();

const app = express();
const port = 3002;

// Para interpretar body como JSON
app.use(express.json());

app.use("/tareas", tareasRouter);

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`);
});