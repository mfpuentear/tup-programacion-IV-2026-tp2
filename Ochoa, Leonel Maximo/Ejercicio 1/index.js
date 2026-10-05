import express from "express";
import { conectarDB } from "./db.js";
import rectangulosRouter from "./rectangulos.js";

await conectarDB();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Para interpretar body como JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de rectángulos");
});

app.use("/rectangulos", rectangulosRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en ${port}`);
});
