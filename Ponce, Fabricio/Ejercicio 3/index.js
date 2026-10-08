import express from "express";
import db from "./db.js";
import alumnosRouter from "./alumnos.js";
import materiasRouter from "./materias.js";

const app = express();
const PORT = 3003;

app.use(express.json());

try {
    await db.query("SELECT 1");
    console.log("Conexión a MySQL exitosa");
} catch (error) {
    console.error("Error al conectar con MySQL:", error.message);
}

app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);

app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`);
});