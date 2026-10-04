import "dotenv/config";
import express from "express";
import { conectarDB } from "./db.js";
import tareasRouter from "./tareas.js";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use("/tareas", tareasRouter);

await conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

export default app;
