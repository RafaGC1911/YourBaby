let conexion = require("../configuracion/base_datos");

let crearPanal = (panal) => {
  let sql = `
        INSERT INTO panales
        (bebe_id, fecha_hora, tipo, observaciones)
        VALUES (?, ?, ?, ?)
    `;

  return conexion
    .promise()
    .query(sql, [
      panal.bebe_id,
      panal.fecha_hora,
      panal.tipo,
      panal.observaciones,
    ]);
};

let obtenerPanales = () => {
  let sql = `
        SELECT *
        FROM panales
    `;

  return conexion.promise().query(sql);
};

let obtenerPanalesPorBebe = (bebeId) => {
  let sql = `
        SELECT *
        FROM panales
        WHERE bebe_id = ?
    `;

  return conexion.promise().query(sql, [bebeId]);
};

let actualizarPanal = (id, panal) => {
  let campos = [];
  let valores = [];

  if (panal.bebe_id !== undefined) {
    campos.push("bebe_id = ?");
    valores.push(panal.bebe_id);
  }

  if (panal.fecha_hora !== undefined) {
    campos.push("fecha_hora = ?");
    valores.push(panal.fecha_hora);
  }

  if (panal.tipo !== undefined) {
    campos.push("tipo = ?");
    valores.push(panal.tipo);
  }

  if (panal.observaciones !== undefined) {
    campos.push("observaciones = ?");
    valores.push(panal.observaciones);
  }

  let sql = `
        UPDATE panales
        SET ${campos.join(", ")}
        WHERE id = ?
    `;

  valores.push(id);

  return conexion.promise().query(sql, valores);
};

let eliminarPanal = (id) => {
  let sql = `
        DELETE FROM panales
        WHERE id = ?
    `;

  return conexion.promise().query(sql, [id]);
};

module.exports = {
  crearPanal,
  obtenerPanales,
  obtenerPanalesPorBebe,
  actualizarPanal,
  eliminarPanal,
};
