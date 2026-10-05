import express from "express";
import { conectarDB } from "./db.js";
import  alumnosRouter from "./alumnos.js";
import materiasRouter from "./materias.js";
import notasRouter from "./notas.js";       


conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);
app.use("/notas", notasRouter);

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`);
});
