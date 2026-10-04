import "dotenv/config";
import express from "express";
import { conectarDB } from "./db.js";
import rectangulosRouter from "./rectangulos.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/rectangulos", rectangulosRouter);

await conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

export default app;
