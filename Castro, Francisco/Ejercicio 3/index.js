import "dotenv/config";
import express from "express";
import { conectarDB } from "./db.js";
import materiasRouter from "./materias.js";
import calificacionesRouter from "./calificaciones.js";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.use("/materias", materiasRouter);
app.use("/calificaciones", calificacionesRouter);

await conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

export default app;
