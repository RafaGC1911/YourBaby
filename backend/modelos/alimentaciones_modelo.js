let conexion = require("../configuracion/base_datos");

//Crear una alimentación
let crearAlimentacion = (alimentacion) => {
  let sql = `
  INSERT INTO alimentaciones
  (bebe_id, tipo, fecha_hora, cantidad_ml, observaciones)
  VALUES (?, ?, ?, ?, ?)
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

//Comprobar que un bebé pertenece al usuario que ha iniciado sesión
let comprobarBebeUsuario = (bebeId, usuarioId) => {
  let sql = `
  SELECT id FROM bebes
  WHERE id = ? AND usuario_id = ?
  `;

  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Obtener todas las alimentaciones del usuario
let obtenerAlimentaciones = (usuarioId) => {
  let sql = `
  SELECT alimentaciones.*
  FROM alimentaciones
  INNER JOIN bebes
  ON alimentaciones.bebe_id = bebes.id
  WHERE bebes.usuario_id = ?
  `;

  return conexion.promise().query(sql, [usuarioId]);
};

//Obtener las alimentaciones de un bebé comprobando su propietario
let obtenerAlimentacionesPorBebe = (bebeId, usuarioId) => {
  let sql = `
  SELECT alimentaciones.*
  FROM alimentaciones
  INNER JOIN bebes
  ON alimentaciones.bebe_id = bebes.id
  WHERE alimentaciones.bebe_id = ?
  AND bebes.usuario_id = ?
  `;

  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Actualizar una alimentación comprobando que pertenece al usuario
let actualizarAlimentacion = (id, usuarioId, alimentacion) => {
  let campos = [];
  let valores = [];

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

  let sql = `
  UPDATE alimentaciones
  INNER JOIN bebes
  ON alimentaciones.bebe_id = bebes.id
  SET ${campos.join(", ")}
  WHERE alimentaciones.id = ?
  AND bebes.usuario_id = ?
  `;

  valores.push(id, usuarioId);

  return conexion.promise().query(sql, valores);
};

//Eliminar una alimentación comprobando que pertenece al usuario
let eliminarAlimentacion = (id, usuarioId) => {
  let sql = `
  DELETE alimentaciones
  FROM alimentaciones
  INNER JOIN bebes
  ON alimentaciones.bebe_id = bebes.id
  WHERE alimentaciones.id = ?
  AND bebes.usuario_id = ?
  `;

  return conexion.promise().query(sql, [id, usuarioId]);
};

module.exports = {
  crearAlimentacion,
  comprobarBebeUsuario,
  obtenerAlimentaciones,
  obtenerAlimentacionesPorBebe,
  actualizarAlimentacion,
  eliminarAlimentacion,
};
