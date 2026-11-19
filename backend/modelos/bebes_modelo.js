let conexion = require("../configuracion/base_datos");

//Crear un bebé y registrar automáticamente su peso de nacimiento
let crearBebe = (usuarioId, bebe) => {
  /*
  Inicio una transacción para asegurarme de que las dos inserciones
  (bebé y peso inicial) se realizan correctamente.

  Si alguna falla, podré deshacer los cambios y evitar que quede
  registrado un bebé sin su correspondiente peso inicial.
  */
  return conexion
    .promise()
    .beginTransaction()
    .then(() => {
      //Inserto primero los datos del bebé en su tabla
      let sqlBebe = `
      INSERT INTO bebes
      (usuario_id, nombre, fecha_nacimiento, peso_nacimiento)
      VALUES (?, ?, ?, ?)
    `;

      return conexion
        .promise()
        .query(sqlBebe, [
          usuarioId,
          bebe.nombre,
          bebe.fecha_nacimiento,
          bebe.peso_nacimiento,
        ]);
    })
    .then(([resultadoBebe]) => {
      /*
    Recupero el ID que MySQL acaba de asignar al bebé.
    Lo necesito para relacionar su peso inicial con él.
    */
      let bebeId = resultadoBebe.insertId;

      //Convierto el peso de gramos a kilogramos
      let pesoEnKg = bebe.peso_nacimiento / 1000;

      //Preparo la inserción del peso de nacimiento
      let sqlPeso = `
      INSERT INTO pesos
      (bebe_id, peso, fecha, observaciones)
      VALUES (?, ?, ?, ?)
    `;

      return conexion
        .promise()
        .query(sqlPeso, [
          bebeId,
          pesoEnKg,
          bebe.fecha_nacimiento,
          "Peso al nacer",
        ])
        .then(() => {
          //Confirmo las dos inserciones porque ambas se han realizado correctamente
          return conexion
            .promise()
            .commit()
            .then(() => [resultadoBebe]);
        });
    })
    .catch((error) => {
      /*
    Si ocurre cualquier error, deshago la transacción.
    Así evito guardar solamente el bebé o solamente su peso.
    */
      return conexion
        .promise()
        .rollback()
        .then(() => {
          throw error;
        });
    });
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

//Actualizar un bebé y mantener sincronizado su peso inicial
let actualizarBebe = (id, usuarioId, bebe) => {
  /*
  Inicio una transacción para que la actualización del bebé
  y la de su registro de peso inicial se realicen conjuntamente.
  */
  return conexion
    .promise()
    .beginTransaction()
    .then(() => {
      let campos = [];
      let valores = [];

      //Preparo únicamente los campos del bebé que se quieren modificar
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

      let sqlBebe = `
      UPDATE bebes SET ${campos.join(", ")}
      WHERE id = ? AND usuario_id = ?
    `;

      valores.push(id, usuarioId);

      return conexion.promise().query(sqlBebe, valores);
    })
    .then(([resultadoBebe]) => {
      let camposPeso = [];
      let valoresPeso = [];

      /*
    Compruebo si se ha modificado el peso de nacimiento.
    Si es así, lo convierto de gramos a kilogramos para
    mantener el mismo formato que utilizamos en la tabla pesos.
    */
      if (bebe.peso_nacimiento !== undefined) {
        camposPeso.push("peso = ?");
        valoresPeso.push(Number(bebe.peso_nacimiento) / 1000);
      }

      //Si se modifica la fecha de nacimiento, actualizo también la fecha del peso inicial
      if (bebe.fecha_nacimiento !== undefined) {
        camposPeso.push("fecha = ?");
        valoresPeso.push(bebe.fecha_nacimiento);
      }

      /*
    Solo ejecuto esta consulta cuando se ha modificado el peso
    o la fecha de nacimiento. Así no toco el historial cuando
    únicamente se cambia el nombre del bebé.
    */
      if (camposPeso.length === 0) {
        return conexion
          .promise()
          .commit()
          .then(() => resultadoBebe);
      }

      let sqlPeso = `
      UPDATE pesos SET ${camposPeso.join(", ")}
      WHERE bebe_id = ? AND observaciones = ?
    `;

      //Identifico exclusivamente el registro que creamos al nacer
      valoresPeso.push(id, "Peso al nacer");

      return conexion
        .promise()
        .query(sqlPeso, valoresPeso)
        .then(() => {
          //Confirmo los cambios del bebé y de su peso inicial
          return conexion
            .promise()
            .commit()
            .then(() => resultadoBebe);
        });
    })
    .catch((error) => {
      //Deshago los cambios si alguna de las consultas falla
      return conexion
        .promise()
        .rollback()
        .then(() => {
          throw error;
        });
    });
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
