let conexion = require("../configuracion/base_datos");

let crearSueno = (sueno) => {
  let sql = `
  INSERT INTO sueno
  (bebe_id, inicio, fin, observaciones)
  VALUES (?, ?, ?, ?)`;

  return conexion
    .promise()
    .query(sql, [sueno.bebe_id, sueno.inicio, sueno.fin, sueno.observaciones]);
};

let obtenerSuenos = () => {
  let sql = `
    SELECT *
    FROM sueno
    `;

  return conexion.promise().query(sql);
};

let obtenerSuenosPorBebe = (bebeId) => {
  let sql = `
  SELECT *
  FROM sueno
  WHERE bebe_id = ?`;

  return conexion.promise().query(sql, [bebeId]);
};

let actualizarSueno = (id, sueno) => {
  let campos = [];
  let valores = [];

  if (sueno.inicio !== undefined) {
    campos.push("inicio = ?");
    valores.push(sueno.inicio);
  }

  if (sueno.fin !== undefined) {
    campos.push("fin = ?");
    valores.push(sueno.fin);
  }

  if (sueno.observaciones !== undefined) {
    campos.push("observaciones = ?");
    valores.push(sueno.observaciones);
  }

  let sql = `
        UPDATE sueno
        SET ${campos.join(", ")}
        WHERE id = ?
    `;

  valores.push(id);

  return conexion.promise().query(sql, valores);
};

let eliminarSueno = (id) => {
  let sql = `
     DELETE FROM sueno
     WHERE id = ?
    `;

  return conexion.promise().query(sql, [id]);
};

module.exports = {
  crearSueno,
  obtenerSuenos,
  obtenerSuenosPorBebe,
  actualizarSueno,
  eliminarSueno
};
