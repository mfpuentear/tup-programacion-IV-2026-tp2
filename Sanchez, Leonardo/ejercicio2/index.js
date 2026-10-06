import express from "express"
import { conectarDB } from "./db.js"
import tareasRouter from "./tareas.js"

const app = express()
const PORT = process.env.PORT || 3000

await conectarDB()

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hola mundo!")
})

app.use("/tareas", tareasRouter)

app.listen(PORT, () => {
  console.log(`Servidor esta corriendo en http://localhost:${PORT}`)
})
