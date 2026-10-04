import express from "express";
import rectangulosRouter from "./rectangulos.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/rectangulos", rectangulosRouter);

app.listen(port, () => {
    console.log(`API de rectángulos en http://localhost:${port}`);
});