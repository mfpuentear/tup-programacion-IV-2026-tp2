import express from "express";
import db from "./db.js";
import tareasRouter from "./tareas.js";

const app = express();
const PORT = 3002;

app.use(express.json());

try {
    await db.query("SELECT 1");
    console.log("Conexión a MySQL exitosa");
} catch (error) {
    console.error("Error al conectar con MySQL:", error.message);
}

app.use("/tareas", tareasRouter);

app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`);
});