import express from "express";
import rectangulosRouter from "./rectangulos.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/rectangulos", rectangulosRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(port, () => {
  console.log(`La aplicación está funcionando en ${port}`);
});