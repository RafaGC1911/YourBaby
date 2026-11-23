
/*Cargar las variables de entorno del archivo .env
Así puedo utilizar las credenciales de MySQL sin escribirlas directamente en el código.*/
require("dotenv").config();

//Cargar la librería mysql2 para trabajar con la base de datos
let mysql = require("mysql2");

//Crear conexión con MySQL utilizando los datos guardados en .env
let conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true, //Así evito que mysql2 convierta las fechas en objetos Date y provoque problemas con los husos horarios.
});

//Manejar el error si lo hubiese
conexion.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
    return;
  }

  console.log("Conectado correctamente a la base de datos");
});

//Sacar la conexión fuera para permitir que otros archivos puedan usar esta conexión
module.exports = conexion;
