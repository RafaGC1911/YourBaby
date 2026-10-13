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

let obtenerAlimentaciones = () => {
  let sql = `SELECT * FROM alimentaciones`;
  return conexion.promise().query(sql);
};

let obtenerAlimentacionesPorBebe = (bebeId) => {
  let sql = `
  SELECT * FROM alimentaciones
  WHERE bebe_id = ?
  `;

  return conexion.promise().query(sql, [bebeId]);
};

//Aquí en vez de método PUT voy a usar PATCH, ya que PUT necesita que el usuario rellene todos los campos y PATCH no
let actualizarAlimentacion = (id, alimentacion) => {
  let campos = [];
  let valores = [];

  if (alimentacion.bebe_id !== undefined) {//Si existe este campo en la consulta lo añade al array campos y añade su valor al array valores
    campos.push("bebe_id = ?");
    valores.push(alimentacion.bebe_id);
  }
  if (alimentacion.tipo !== undefined) {
    campos.push("tipo = ?");
    valores.push(alimentacion.tipo);
  }

  if (alimentacion.fecha_hora !== undefined) {
    campos.push("fecha_hora = ?");
    valores.push(alimentacion.fecha_hora);
  }

  if (alimentacion.cantidad_ml !== undefined) {
    campos.push("cantidad_ml = ?");
    valores.push(alimentacion.cantidad_ml);
  }

  if (alimentacion.observaciones !== undefined) {
    campos.push("observaciones = ?");
    valores.push(alimentacion.observaciones);
  }

  let sql = `UPDATE alimentaciones SET ${campos.join(", ")} WHERE id = ?`;//Une los campos para crear una consulta

  valores.push(id);

  return conexion.promise().query(sql, valores);//Devuelve la sentencia sql y los valores para cada campo patcheado
};

const eliminarAlimentacion = (id) => {
    const sql = `
        DELETE FROM alimentaciones
        WHERE id = ?
    `;

    return conexion.promise().query(sql, [id]);
};

module.exports = {
  crearAlimentacion,
  obtenerAlimentaciones,
  obtenerAlimentacionesPorBebe,
  actualizarAlimentacion,
  eliminarAlimentacion
};
