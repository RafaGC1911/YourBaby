let conexion = require("../configuracion/base_datos");

let crearAlimentacion = (alimentacion) => {
  let sql = `
  INSERT INTO alimentaciones
  (bebe_id, tipo, fecha_hora, cantidad_ml, observaciones)
  VALUES(?, ?, ?, ?, ?)
  `;

  return conexion
    .promise()
    .query(sql, [
      alimentacion.bebe_id,
      alimentacion.tipo,
      alimentacion.fecha_hora,
      alimentacion.cantidad_ml,
      alimentacion.observaciones,
    ]);
};

module.exports = { crearAlimentacion };
