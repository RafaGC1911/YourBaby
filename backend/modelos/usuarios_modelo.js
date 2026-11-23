
//Importo la conexión a MySQL para poder realizar consultas a la tabla usuarios.
let conexion = require("../configuracion/base_datos");

//Buscar un usuario por su nombre de usuario
let obtenerUsuarioPorNombre = (nombreUsuario) => {
  let sql = `
    SELECT *
    FROM usuarios
    WHERE nombre_usuario = ?
  `;

  return conexion.promise().query(sql, [nombreUsuario]);
};

//Buscar un usuario por su correo electrónico
let obtenerUsuarioPorCorreo = (correoElectronico) => {
  let sql = `
    SELECT *
    FROM usuarios
    WHERE correo_electronico = ?
  `;

  return conexion.promise().query(sql, [correoElectronico]);
};

//Crear un nuevo usuario
let crearUsuario = (usuario) => {
  let sql = `
    INSERT INTO usuarios
    (nombre_usuario, correo_electronico, contrasena)
    VALUES (?, ?, ?)
  `;

  return conexion.promise().query(sql, [
    usuario.nombre_usuario,
    usuario.correo_electronico,
    usuario.contrasena,
  ]);
};

//Comprobar si el nombre de usuario o el correo ya están registrados
let comprobarUsuarioExistente = (nombreUsuario, correoElectronico) => {
  let sql = `
    SELECT id, nombre_usuario, correo_electronico
    FROM usuarios
    WHERE nombre_usuario = ? OR correo_electronico = ?
  `;

  return conexion.promise().query(sql, [nombreUsuario, correoElectronico]);
};

//Exportar las funciones para utilizarlas desde el controlador
module.exports = {
  obtenerUsuarioPorNombre,
  obtenerUsuarioPorCorreo,
  crearUsuario,
  comprobarUsuarioExistente,
};
