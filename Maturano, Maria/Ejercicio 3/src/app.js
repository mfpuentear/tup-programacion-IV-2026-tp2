import "dotenv/config";
import express from "express";
import { pool } from "./db.js";
import materiasRouter from "./routes/materias.routes.js";
import alumnosRouter from "./routes/alumnos.routes.js";
import calificacionesRouter from "./routes/calificaciones.routes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true }));

app.use("/materias", materiasRouter);

app.use("/alumnos", alumnosRouter);

app.use("/calificaciones", calificacionesRouter);

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo no es un JSON válido" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  try {
    await pool.query("SELECT 1");
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error al conectar con la base:", error.message);
  }
});