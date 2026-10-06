import express from "express";
import { conectarDB } from "./db.js";
import rectangulosRouter from "./rectangulos.js";

await conectarDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Gestión de Rectángulos Funcionando");
});

app.use("/rectangulos", rectangulosRouter);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});