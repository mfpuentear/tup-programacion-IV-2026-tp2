import express from "express";
import db from "./db.js";
import rectangulosRouter from "./rectangulos.js";

const app = express();
const PORT = 3001;

app.use(express.json());

try {
    await db.query("SELECT 1");
    console.log("Conexión a MySQL exitosa");
} catch (error) {
    console.error("Error al conectar con MySQL:", error.message);
}

app.use("/rectangulos", rectangulosRouter);

app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`);
});