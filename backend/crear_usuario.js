
/*
Importo las funciones del modelo que necesito para comprobar
si ya existe una cuenta y guardar la nueva en MySQL.
*/
let {
  comprobarUsuarioExistente,
  crearUsuario,
} = require("./modelos/usuarios_modelo");

//Importo bcryptjs para generar el hash de la contraseña
let bcrypt = require("bcryptjs");

//Importo las herramientas necesarias para preguntar datos por la terminal
let readline = require("readline/promises");
let { stdin, stdout } = require("process");

//Importo la conexión para poder cerrarla al terminar el script
let conexion = require("./configuracion/base_datos");

//Creo la interfaz que permite escribir y recibir respuestas por la terminal
let interfaz = readline.createInterface({
  input: stdin,
  output: stdout,
});

//Función para crear la cuenta familiar
let crearCuentaFamiliar = async () => {
  try {
    //Compruebo si ya existe algún usuario en la base de datos
    let [usuarios] = await comprobarUsuarioExistente();

    //Impido crear otra cuenta porque YourBaby utiliza una única cuenta familiar
    if (usuarios.length > 0) {
      console.log("Ya existe una cuenta familiar. No se puede crear otra.");
      return;
    }

    //Solicito el nombre de usuario y la contraseña por la terminal
    let nombreUsuario = await interfaz.question("Nombre de usuario: ");
    let contrasena = await interfaz.question("Contraseña: ");

    //Compruebo que los campos no estén vacíos
    if (!nombreUsuario.trim() || !contrasena) {
      console.log("Debes introducir el usuario y la contraseña.");
      return;
    }

    //Compruebo que la contraseña tenga al menos ocho caracteres
    if (contrasena.length < 8) {
      console.log("La contraseña debe tener al menos ocho caracteres.");
      return;
    }

    /*
    Genero el hash de la contraseña antes de guardarla.
    El valor 10 establece el coste de cálculo que utiliza bcrypt.
    */
    let hash = await bcrypt.hash(contrasena, 10);

    //Guardo el usuario y su contraseña hasheada en MySQL
    await crearUsuario({
      nombre_usuario: nombreUsuario.trim(),
      contrasena: hash,
    });

    console.log("La cuenta familiar se ha creado correctamente.");

  } catch (error) {
    console.error("Error al crear la cuenta familiar:", error);

  } finally {
    //Cierro la interfaz y la conexión a MySQL al terminar
    interfaz.close();
    await conexion.promise().end();
  }
};

//Ejecuto la función para iniciar el proceso de creación
crearCuentaFamiliar();
