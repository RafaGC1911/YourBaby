//Importo la conexión a MySQL para poder realizar consultas a la tabla usuarios.

let conexion = require("../configuracion/base_datos");

//Buscar un usuario por su nombre de usuario
let obtenerUsuarioPorNombre = (nombreUsuario) => {
  let sql = `
    SELECT *
    FROM usuarios
    WHERE nombre_usuario = ?
  `;

  return conexion.promise().query(sql, [nombreUsuario]); //ejecuta la consulta
};

//Crear un nuevo usuario
let crearUsuario = (usuario) => {
  let sql = `
    INSERT INTO usuarios
    (nombre_usuario, contrasena)
    VALUES (?, ?)
  `;

  return conexion
    .promise()
    .query(sql, [usuario.nombre_usuario, usuario.contrasena]);
};

//Comprobar si ya existe una cuenta familiar
let comprobarUsuarioExistente = () => {
  let sql = `
    SELECT id
    FROM usuarios
    LIMIT 1
  `;

  return conexion.promise().query(sql);
};

//Exportar las funciones para utilizarlas desde el controlador
module.exports = {
  obtenerUsuarioPorNombre,
  crearUsuario,
  comprobarUsuarioExistente,
};
