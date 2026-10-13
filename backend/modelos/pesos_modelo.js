let conexion = require("../configuracion/base_datos");

let crearPeso = (peso) => {
  let sql = `
        INSERT INTO pesos
        (bebe_id, peso, fecha, observaciones)
        VALUES (?, ?, ?, ?)
    `;

  return conexion
    .promise()
    .query(sql, [peso.bebe_id, peso.peso, peso.fecha, peso.observaciones]);
};

let obtenerPesos = () => {
  let sql = `
        SELECT *
        FROM pesos
        ORDER BY fecha DESC, id DESC
    `;//Ordenado para que aparezca de más reciente a más antigua

  return conexion.promise().query(sql);
};

let obtenerPesosPorBebe = (bebeId) => {
  let sql = `
        SELECT *
        FROM pesos
        WHERE bebe_id = ?
        ORDER BY fecha DESC, id DESC
    `;

  return conexion.promise().query(sql, [bebeId]);
};

let actualizarPeso = (id, peso) => {
  let campos = [];
  let valores = [];

  if (peso.bebe_id !== undefined) {
    campos.push("bebe_id = ?");
    valores.push(peso.bebe_id);
  }

  if (peso.peso !== undefined) {
    campos.push("peso = ?");
    valores.push(peso.peso);
  }

  if (peso.fecha !== undefined) {
    campos.push("fecha = ?");
    valores.push(peso.fecha);
  }

  if (peso.observaciones !== undefined) {
    campos.push("observaciones = ?");
    valores.push(peso.observaciones);
  }

  let sql = `
        UPDATE pesos
        SET ${campos.join(", ")}
        WHERE id = ?
    `;

  valores.push(id);

  return conexion.promise().query(sql, valores);
};

let eliminarPeso = (id) => {
  let sql = `
        DELETE FROM pesos
        WHERE id = ?
    `;

  return conexion.promise().query(sql, [id]);
};

module.exports = {
  crearPeso,
  obtenerPesos,
  obtenerPesosPorBebe,
  actualizarPeso,
  eliminarPeso,
};
