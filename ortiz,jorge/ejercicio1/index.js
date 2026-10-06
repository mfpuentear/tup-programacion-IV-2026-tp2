import express from "express";
import { conectarDB } from "./db.js";
import routerRectangulos from "./rectangulos.js"
await conectarDB()


const app = express(); //inicilizamos Express que va a recibir y procesar las solicitudes HTTP.
const port = 3000; 

app.use(express.json()); //recibimos los datos en formato json para que esten disponibles en req.body


app.get("/", (req, res) => {
  res.send("Hola");
});


app.use("/rectangulos",routerRectangulos )
app.listen(port, () => {
  console.log(`el puerto ${port} esta funcionando`);
});

/*

utilizamos ExpressJS como framework para implementar la API REST. El archivo index.js es utilizado como punto de entrada de la aplicación y concentra la configuración general del servidor. 
Las operaciones para determinar el objeto, es decir el rectangulo fueron modularizadas en un router (rectangulos.js) a travez de la ruta /rectangulos, para una mejor organización y separación de responsabilidades. Asimiamo la conexión con mysql también se encuentra modularizada en db.js, con el fin de no mezclar la configuración de persistencia y la lógica de las rutas, ademas de los otros motivos anteriormente mencionados 

*/