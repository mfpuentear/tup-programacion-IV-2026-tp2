import express from "express";
import { body, param, validationResult } from "express-validator";
import { db, conectarDB } from "./db.js";
import tareasRouter from "./tareas.js";

await conectarDB();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola mundo!");
});

app.use("/tareas", tareasRouter);

app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));
