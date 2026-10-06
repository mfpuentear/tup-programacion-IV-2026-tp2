import express from "express";
import { conectarDB } from "./db.js";
import routerAlumnos from "./alumnos.js"
import routerMaterias from './materias.js';
conectarDB()

const app = express();
const port = 3000;

app.use(express.json());


app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use("/alumnos", routerAlumnos);
app.use("/materias",routerMaterias);

app.listen(port, () => {
    console.log(`puerto ${port} funcionando`);
});