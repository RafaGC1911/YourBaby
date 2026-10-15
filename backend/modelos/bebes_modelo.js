let conexion = require("../configuracion/base_datos");

let crearBebe = (bebe) => {
  let sql = `
  INSERT INTO bebes
  (nombre, fecha_nacimiento, peso_nacimiento)
  VALUES (?, ?, ?)
  `;

  return conexion
    .promise()
    .query(sql, [bebe.nombre, bebe.fecha_nacimiento, bebe.peso_nacimiento]);
};

/**
 * Necesito promise() para convertir la conexión y que funcione con promesas, así luego podré usar la asincronía cuando llame a la función desde
 * el front.
 * .query() recibe la plantilla SQL y el array de valores que vienen del objeto "bebe".
 *
 */

let obtenerBebes = () => {
  let sql = `
  SELECT * FROM bebes
  `;

  return conexion.promise().query(sql);
};

let obtenerBebeId = (id) => {
  let sql = `SELECT * FROM bebes WHERE id = ?`;
  return conexion.promise().query(sql, [id]);
};

let actualizarBebe = (id, bebe) => {
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

  let sql = `UPDATE bebes SET ${campos.join(", ")} WHERE id = ? `;

  valores.push(id);

  return conexion.promise().query(sql, valores);
};

let eliminarBebe = (id) => {
  let sql = `DELETE FROM bebes WHERE id = ?`;
  return conexion.promise().query(sql, [id]);
};

module.exports = {
  crearBebe,
  obtenerBebes,
  obtenerBebeId,
  actualizarBebe,
  eliminarBebe,
};
