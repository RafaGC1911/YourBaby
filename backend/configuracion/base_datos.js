//Cargar la librería
let mysql = require("mysql2");

//Crear conexión con Mysql (configuración)
let conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "yourbaby",
  dateStrings: true //De esta forma mysql2 no convierte las fechas de MySQL en objetos Date de Javascript, los va a devolver como texto
  //Así evito que luego haya problemas con usos horarios y conversiones
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
//Es necesario cargarlo en el archivo servidor.js para que se ejecute
module.exports = conexion;

