let conexion = require("../configuracion/base_datos");

//Crear un bebé y asociarlo al usuario que ha iniciado sesión
let crearBebe = (usuarioId, bebe) => {
  let sql = `
  INSERT INTO bebes
  (usuario_id, nombre, fecha_nacimiento, peso_nacimiento)
  VALUES (?, ?, ?, ?)
  `;

  return conexion
    .promise()
    .query(sql, [
      usuarioId,
      bebe.nombre,
      bebe.fecha_nacimiento,
      bebe.peso_nacimiento,
    ]);
};

//Obtener únicamente los bebés del usuario que ha iniciado sesión
let obtenerBebes = (usuarioId) => {
  let sql = `
  SELECT * FROM bebes
  WHERE usuario_id = ?
  `;

  return conexion.promise().query(sql, [usuarioId]);
};

//Obtener un bebé comprobando su ID y quién es su propietario
let obtenerBebeId = (id, usuarioId) => {
  let sql = `
  SELECT * FROM bebes
  WHERE id = ? AND usuario_id = ?
  `;

  return conexion.promise().query(sql, [id, usuarioId]);
};

//Actualizar un bebé comprobando que pertenece al usuario
let actualizarBebe = (id, usuarioId, bebe) => {
  let campos = [];
  let valores = [];

  if (bebe.nombre !== undefined) {
    campos.push("nombre = ?");
    valores.push(bebe.nombre);
  }

  if (bebe.fecha_nacimiento !== undefined) {
    campos.push("fecha_nacimiento = ?");
    valores.push(bebe.fecha_nacimiento);
  }

  if (bebe.peso_nacimiento !== undefined) {
    campos.push("peso_nacimiento = ?");
    valores.push(bebe.peso_nacimiento);
  }

  let sql = `
  UPDATE bebes
  SET ${campos.join(", ")}
  WHERE id = ? AND usuario_id = ?
  `;

  valores.push(id, usuarioId);

  return conexion.promise().query(sql, valores);
};

//Eliminar un bebé comprobando que pertenece al usuario
let eliminarBebe = (id, usuarioId) => {
  let sql = `
  DELETE FROM bebes
  WHERE id = ? AND usuario_id = ?
  `;

  return conexion.promise().query(sql, [id, usuarioId]);
};

module.exports = {
  crearBebe,
  obtenerBebes,
  obtenerBebeId,
  actualizarBebe,
  eliminarBebe,
};
