import express from "express";
import { conectarDB } from "./db.js";
import rectangulosRouter from "./rectangulos.js";

await conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de rectangulos");
});

app.use("/rectangulos", rectangulosRouter);

app.listen(PORT, () => {
    console.log(`API funcionando en http://localhost:${PORT}`);
});