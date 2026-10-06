import express from "express";
import { conectarDB } from "./db.js";
import tareasRouter from "./tareas.js";

await conectarDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de tareas");
});

app.use("/tareas", tareasRouter);

app.listen(PORT, () => {
    console.log(`API funcionando en http://localhost:${PORT}`);
});