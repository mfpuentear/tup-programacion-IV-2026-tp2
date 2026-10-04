import express from "express";
import { body, param, validationResult } from "express-validator";
import { db, conectarDB } from "./db.js";
import rectangulosRouter from "./rectangulos.js";

await conectarDB();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use("/rectangulos", rectangulosRouter);

app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));
