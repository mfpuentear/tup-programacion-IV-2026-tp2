/*En index.js es el punto de entrada de la API y se encarga de iniciar el servidor Express.
Conecta la base de datos y configura la recepción de datos en formato JSON.
También incorpora las rutas de alumnos y materias mediante sus respectivos routers.
Finalmente, inicia el servidor en el puerto 3000 para recibir las solicitudes.*/

import express from "express"
import { conectarDB } from "./db.js"
import alumnosRouter from "./alumnos.js"
import materiasRouter from "./materias.js"


conectarDB ();

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req,res) => {
    res.send("Hola Mundo!")
});

app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);

app.listen(port, () => {
    console.log(`La aplicación esta funcionando en ${port}`);
})