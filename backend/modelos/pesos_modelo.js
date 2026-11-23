let conexion = require("../configuracion/base_datos");

//Crear una nueva medición de peso
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

//Comprobar que un bebé pertenece al usuario que ha iniciado sesión
let comprobarBebeUsuario = (bebeId, usuarioId) => {
  let sql = `
    SELECT id
    FROM bebes
    WHERE id = ? AND usuario_id = ?
  `;

  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Obtener todas las mediciones de los bebés del usuario
let obtenerPesos = (usuarioId) => {
  let sql = `
    SELECT pesos.*
    FROM pesos
    INNER JOIN bebes
    ON pesos.bebe_id = bebes.id
    WHERE bebes.usuario_id = ?
    ORDER BY pesos.fecha DESC, pesos.id DESC
  `;

  return conexion.promise().query(sql, [usuarioId]);
};

//Obtener las mediciones de un bebé comprobando su propietario
let obtenerPesosPorBebe = (bebeId, usuarioId) => {
  let sql = `
    SELECT pesos.*
    FROM pesos
    INNER JOIN bebes
    ON pesos.bebe_id = bebes.id
    WHERE pesos.bebe_id = ?
    AND bebes.usuario_id = ?
    ORDER BY pesos.fecha DESC, pesos.id DESC
  `;

  return conexion.promise().query(sql, [bebeId, usuarioId]);
};

//Actualizar una medición comprobando que pertenece al usuario
let actualizarPeso = (id, usuarioId, peso) => {
  let campos = [];
  let valores = [];

  //Voy añadiendo a la consulta únicamente los campos recibidos
  if (peso.bebe_id !== undefined) {
    campos.push("pesos.bebe_id = ?");
    valores.push(peso.bebe_id);
  }

  if (peso.peso !== undefined) {
    campos.push("pesos.peso = ?");
    valores.push(peso.peso);
  }

  if (peso.fecha !== undefined) {
    campos.push("pesos.fecha = ?");
    valores.push(peso.fecha);
  }

  if (peso.observaciones !== undefined) {
    campos.push("pesos.observaciones = ?");
    valores.push(peso.observaciones);
  }

  let sql = `
    UPDATE pesos
    INNER JOIN bebes
    ON pesos.bebe_id = bebes.id
    SET ${campos.join(", ")}
    WHERE pesos.id = ?
    AND bebes.usuario_id = ?
  `;

  //Añado el ID de la medición y el usuario al final de los parámetros
  valores.push(id, usuarioId);

  return conexion.promise().query(sql, valores);
};

//Eliminar una medición comprobando que pertenece al usuario
let eliminarPeso = (id, usuarioId) => {
  let sql = `
    DELETE pesos
    FROM pesos
    INNER JOIN bebes
    ON pesos.bebe_id = bebes.id
    WHERE pesos.id = ?
    AND bebes.usuario_id = ?
  `;

  return conexion.promise().query(sql, [id, usuarioId]);
};

module.exports = {
  crearPeso,
  comprobarBebeUsuario,
  obtenerPesos,
  obtenerPesosPorBebe,
  actualizarPeso,
  eliminarPeso,
};
