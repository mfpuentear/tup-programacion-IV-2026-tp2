import express from "express";
import tareasRouter from "./tareas.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/tareas", tareasRouter);

app.listen(port, () => {
    console.log(`API de tareas en http://localhost:${port}`);
});