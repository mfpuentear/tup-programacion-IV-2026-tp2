import mysql from "mysql2/promise";

export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "tp2_rectangulos",
    decimalNumbers: true, // sin esto los DECIMAL vuelven como texto ("5.00")
});