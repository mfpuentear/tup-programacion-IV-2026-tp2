import express from "express"
import { conectarDB } from "./db.js"
import alumnosRouter from "./alumnos.js"
import materiasRouter from "./materias.js"
import calificacionesRouter from "./calificaciones.js"

const app = express()
const PORT = process.env.PORT || 3000

await conectarDB()

app.use(express.json())

app.get("/", (req, res) => {
  res.send("API de calificaciones funcionando")
})

app.use("/alumnos", alumnosRouter)
app.use("/materias", materiasRouter)
app.use("/calificaciones", calificacionesRouter)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
