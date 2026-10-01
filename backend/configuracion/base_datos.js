let mysql = require("mysql2");

let conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "yourbaby",
});

conexion.connect((error) => {
  if (error) {
    console.error("Error al conectar a la base de datos:", error);
    return;
  }
  console.log("Conectado correctamente a la base de datos");
});


module.exports = conexion;