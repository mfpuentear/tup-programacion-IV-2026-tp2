import mysql from "mysql2/promise";
export let db;

export async function conectarDB (){
    
db = await mysql.createConnection({
  host: process.env.DB_HOST, // Dominio (url) de db
  user: process.env.DB_USER, // Usuario
  password: process.env.DB_PASS, // Contraseña
  database: process.env.DB_NAME, // Esquema
});

console.log("DB:", process.env.DB_NAME);
}

/* modelo de datos : 
tabla_ejercicio1 :  
          campos : - id: Para identificar cada objeto, es primary key y auto intcrement para que no sea proporcionado por el cliente
                    - base y altura : datos para definir el objeto, enviados por el cliente y validados antes de ser almacenados
                    - superficie, perimeto : datos calculados por el servidor para vitar que el cliente pueda enviar valores erroneos.
          
*/