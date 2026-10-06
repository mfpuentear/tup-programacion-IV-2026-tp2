import express from "express";
import { conectarDB } from "./db.js";
import Rtareas from "./tareas.js"
conectarDB()

const app = express();
const port = 3000;

app.use(express.json());


app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use("/tareas", Rtareas);

app.listen(port, () => {
    console.log(`puerto ${port} funcionando`);
});