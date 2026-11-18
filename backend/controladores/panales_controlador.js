let {
  comprobarBebeUsuario,
  crearPanal,
  obtenerPanales: obtenerPanalesModelo,
  obtenerPanalesPorBebe: obtenerPanalesPorBebeModelo,
  obtenerPanalIdUsuario: obtenerPanalIdUsuarioModelo,
  actualizarPanal: actualizarPanalModelo,
  eliminarPanal: eliminarPanalModelo,
} = require("../modelos/panales_modelo");

//Comprobar que un ID sea un número entero positivo
let validarId = (id) => {
  return Number.isInteger(Number(id)) && Number(id) > 0;
};

//Comprobar que la fecha sea válida
let validarFecha = (fecha) => {
  if (typeof fecha !== "string" || fecha.trim() === "") {
    return false;
  }

  let fechaConvertida = new Date(fecha);

  return !isNaN(fechaConvertida.getTime());
};

/**
 * Compruebo que la fecha y hora sean válidas y que no sean posteriores
 * al momento actual.
 */
let validarFechaNoFutura = (fecha) => {
  //Primero compruebo que la fecha tenga un valor válido.
  if (!validarFecha(fecha)) {
    return false;
  }

  //Comparo la fecha indicada con la fecha y hora actuales.
  return new Date(fecha) <= new Date();
};

//Tipos de pañal que permitimos registrar
let tiposPermitidos = ["pipí", "caca", "mixto"];

//Registrar un pañal
let guardarPanal = async (req, res) => {
  try {
    let { bebe_id, fecha_hora, tipo, observaciones } = req.body;

    //Comprobar que se hayan enviado los datos obligatorios
    if (!bebe_id || !fecha_hora || !tipo) {
      return res.status(400).json({
        message: "El bebé, la fecha y el tipo de pañal son obligatorios",
      });
    }

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebe_id)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    //Comprobar que la fecha sea válida y no esté en el futuro
    if (!validarFechaNoFutura(fecha_hora)) {
      return res.status(400).json({
        message: "La fecha y hora no pueden ser posteriores al momento actual",
      });
    }

    //Comprobar que el tipo esté entre los permitidos
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        message: "El tipo debe ser pipí, caca o mixto",
      });
    }

    /**
     * Compruebo que el bebé seleccionado pertenece al usuario que
     * tiene la sesión iniciada antes de guardar el registro.
     *
     * Utilizo req.usuario.id porque este dato procede del token JWT
     * que comprueba previamente el middleware de autenticación.
     */
    let [bebes] = await comprobarBebeUsuario(Number(bebe_id), req.usuario.id);

    //Si no encuentro el bebé con ese propietario, rechazo la operación.
    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    //Preparo los datos que voy a guardar en la base de datos.
    let panal = {
      bebe_id: Number(bebe_id),
      fecha_hora,
      tipo,
      observaciones: observaciones ?? null,
    };

    let [resultado] = await crearPanal(panal);

    return res.status(201).json({
      message: "Registro de pañal creado correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear el registro de pañal:", error);

    return res.status(500).json({
      message: "Error interno al crear el registro de pañal",
    });
  }
};

//Obtener todos los pañales del usuario autenticado
let obtenerPanales = async (req, res) => {
  try {
    //Paso el ID del usuario para recuperar únicamente sus registros.
    let [panales] = await obtenerPanalesModelo(req.usuario.id);

    return res.status(200).json({
      message: "Registros de pañales obtenidos correctamente",
      data: panales,
    });
  } catch (error) {
    console.error("Error al obtener los registros de pañales:", error);

    return res.status(500).json({
      message: "Error interno al obtener los registros",
    });
  }
};

//Obtener los pañales de un bebé concreto
let obtenerPanalesPorBebe = async (req, res) => {
  try {
    let { bebeId } = req.params;

    //Comprobar que el ID del bebé sea válido
    if (!validarId(bebeId)) {
      return res.status(400).json({
        message: "El ID del bebé debe ser un número entero positivo",
      });
    }

    /**
     * Compruebo primero que el bebé pertenece al usuario.
     * Así evito consultar registros utilizando el ID de un bebé ajeno.
     */
    let [bebes] = await comprobarBebeUsuario(Number(bebeId), req.usuario.id);

    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    //Recupero los pañales indicando tanto el bebé como el usuario.
    let [panales] = await obtenerPanalesPorBebeModelo(bebeId, req.usuario.id);

    return res.status(200).json({
      message: "Registros de pañales obtenidos correctamente",
      data: panales,
    });
  } catch (error) {
    console.error("Error al obtener los pañales del bebé:", error);

    return res.status(500).json({
      message: "Error interno al obtener los registros del bebé",
    });
  }
};

//Actualizar un pañal
let actualizarPanal = async (req, res) => {
  try {
    let { id } = req.params;
    let panal = req.body ?? {};

    //Comprobar que el ID del pañal sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID debe ser un número entero positivo",
      });
    }

    //No permitir una petición vacía
    if (Object.keys(panal).length === 0) {
      return res.status(400).json({
        message: "Debes indicar al menos un campo para actualizar",
      });
    }

    /**
     * Defino los únicos campos que permito modificar.
     *
     * No incluyo bebe_id porque no quiero que un registro de pañal
     * pueda trasladarse a otro bebé mediante una petición PATCH.
     */
    let camposPermitidos = ["fecha_hora", "tipo", "observaciones"];

    let camposRecibidos = Object.keys(panal);

    //Compruebo que no se envíen campos que no permito modificar.
    let campoNoPermitido = camposRecibidos.some(
      (campo) => !camposPermitidos.includes(campo),
    );

    if (campoNoPermitido) {
      return res.status(400).json({
        message: "Has enviado algún campo no permitido",
      });
    }

    //Validar la fecha solo si se quiere cambiar
    if (
      panal.fecha_hora !== undefined &&
      !validarFechaNoFutura(panal.fecha_hora)
    ) {
      return res.status(400).json({
        message: "La fecha y hora no son válidas",
      });
    }

    //Validar el tipo solo si se quiere cambiar
    if (panal.tipo !== undefined && !tiposPermitidos.includes(panal.tipo)) {
      return res.status(400).json({
        message: "El tipo debe ser pipí, caca o mixto",
      });
    }

    //Evitar que las observaciones tengan un formato incorrecto
    if (
      panal.observaciones !== undefined &&
      panal.observaciones !== null &&
      typeof panal.observaciones !== "string"
    ) {
      return res.status(400).json({
        message: "Las observaciones deben ser texto",
      });
    }

    /**
     * Compruebo que el pañal existe y pertenece al usuario autenticado.
     *
     * Si no aparece en esta consulta, puede ser porque no existe
     * o porque pertenece a otro usuario.
     */
    let [panales] = await obtenerPanalIdUsuarioModelo(id, req.usuario.id);

    if (panales.length === 0) {
      return res.status(404).json({
        message: "No se encontró el registro de pañal",
      });
    }

    //Actualizo únicamente los campos recibidos y permitidos.
    let [resultado] = await actualizarPanalModelo(id, req.usuario.id, panal);

    /**
     * No utilizo affectedRows para decidir si existe el registro.
     * MySQL puede devolver cero cuando se envían los mismos valores
     * que ya estaban guardados, aunque el pañal sí exista.
     *
     * Ya he comprobado su existencia y propietario en la consulta anterior.
     */

    return res.status(200).json({
      message: "Registro de pañal actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar el registro de pañal:", error);

    return res.status(500).json({
      message: "Error interno al actualizar el registro",
    });
  }
};

//Eliminar un pañal
let eliminarPanal = async (req, res) => {
  try {
    let { id } = req.params;

    //Comprobar que el ID del pañal sea válido
    if (!validarId(id)) {
      return res.status(400).json({
        message: "El ID debe ser un número entero positivo",
      });
    }

    /**
     * Paso el ID del usuario al modelo para que la consulta DELETE
     * solamente pueda eliminar pañales de sus propios bebés.
     */
    let [resultado] = await eliminarPanalModelo(id, req.usuario.id);

    //Si no se ha eliminado ninguna fila, el registro no existe o no pertenece al usuario.
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "No se encontró el registro de pañal",
      });
    }

    return res.status(200).json({
      message: "Registro de pañal eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el registro de pañal:", error);

    return res.status(500).json({
      message: "Error interno al eliminar el registro",
    });
  }
};

module.exports = {
  guardarPanal,
  obtenerPanales,
  obtenerPanalesPorBebe,
  actualizarPanal,
  eliminarPanal,
};
