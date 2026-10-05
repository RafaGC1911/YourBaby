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

module.exports = { crearBebe, obtenerBebes };
