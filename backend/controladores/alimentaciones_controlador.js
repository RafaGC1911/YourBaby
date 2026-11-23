let {
  crearAlimentacion,
  comprobarBebeUsuario,
  obtenerAlimentaciones: obtenerAlimentacionesModelo,
  obtenerAlimentacionesPorBebe: obtenerAlimentacionesPorBebeModelo,
  actualizarAlimentacion: actualizarAlimentacionModelo,
  eliminarAlimentacion: eliminarAlimentacionModelo,
} = require("../modelos/alimentaciones_modelo");

//Registrar una alimentación
let guardarAlimentacion = async (req, res) => {
  try {
    let alimentacion = req.body;

    //Comprobar los campos obligatorios
    if (
      !alimentacion.bebe_id ||
      !Number.isInteger(Number(alimentacion.bebe_id)) ||
      Number(alimentacion.bebe_id) <= 0 ||
      typeof alimentacion.tipo !== "string" ||
      alimentacion.tipo.trim() === "" ||
      !alimentacion.fecha_hora
    ) {
      return res.status(400).json({
        message: "Debes indicar el bebé, el tipo y la fecha de la alimentación",
      });
    }

    //La cantidad es opcional, pero debe ser positiva si se indica
    if (
      alimentacion.cantidad_ml !== undefined &&
      alimentacion.cantidad_ml !== null &&
      alimentacion.cantidad_ml !== "" &&
      (!Number.isFinite(Number(alimentacion.cantidad_ml)) ||
        Number(alimentacion.cantidad_ml) <= 0)
    ) {
      return res.status(400).json({
        message: "La cantidad debe ser un número positivo",
      });
    }

    //Comprobar que el bebé pertenece al usuario que ha iniciado sesión
    let [bebes] = await comprobarBebeUsuario(
      Number(alimentacion.bebe_id),
      req.usuario.id,
    );

    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    let datosAlimentacion = {
      bebe_id: Number(alimentacion.bebe_id),
      tipo: alimentacion.tipo.trim(),
      fecha_hora: alimentacion.fecha_hora,
      cantidad_ml:
        alimentacion.cantidad_ml === undefined ||
        alimentacion.cantidad_ml === ""
          ? null
          : alimentacion.cantidad_ml,
      observaciones: alimentacion.observaciones || null,
    };

    let [resultado] = await crearAlimentacion(datosAlimentacion);

    res.status(201).json({
      message: "Alimentación registrada correctamente",
      data: {
        id: resultado.insertId,
        ...datosAlimentacion,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al registrar la alimentación",
    });
  }
};

//Obtener todas las alimentaciones del usuario
let obtenerAlimentaciones = async (req, res) => {
  try {
    let [alimentaciones] = await obtenerAlimentacionesModelo(req.usuario.id);

    res.json({
      message: "Alimentaciones obtenidas correctamente",
      data: alimentaciones,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las alimentaciones",
    });
  }
};

//Obtener las alimentaciones de un bebé
let obtenerAlimentacionesPorBebe = async (req, res) => {
  try {
    let bebeId = req.params.bebeId;

    if (!Number.isInteger(Number(bebeId)) || Number(bebeId) <= 0) {
      return res.status(400).json({
        message: "El identificador del bebé no es válido",
      });
    }

    let [alimentaciones] = await obtenerAlimentacionesPorBebeModelo(
      bebeId,
      req.usuario.id,
    );

    res.json({
      message: "Alimentaciones del bebé obtenidas correctamente",
      data: alimentaciones,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las alimentaciones del bebé",
    });
  }
};

//Actualizar una alimentación
let actualizarAlimentacion = async (req, res) => {
  try {
    let id = req.params.id;
    let alimentacion = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "El identificador de la alimentación no es válido",
      });
    }

    //Solo permito modificar estos campos
    let camposPermitidos = [
      "tipo",
      "fecha_hora",
      "cantidad_ml",
      "observaciones",
    ];

    let datosActualizados = {};

    for (let campo of camposPermitidos) {
      if (alimentacion[campo] !== undefined) {
        datosActualizados[campo] = alimentacion[campo];
      }
    }

    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo válido para actualizar",
      });
    }

    if (
      datosActualizados.tipo !== undefined &&
      (typeof datosActualizados.tipo !== "string" ||
        datosActualizados.tipo.trim() === "")
    ) {
      return res.status(400).json({
        message: "El tipo de alimentación no puede estar vacío",
      });
    }

    if (
      datosActualizados.cantidad_ml !== undefined &&
      datosActualizados.cantidad_ml !== null &&
      datosActualizados.cantidad_ml !== "" &&
      (!Number.isFinite(Number(datosActualizados.cantidad_ml)) ||
        Number(datosActualizados.cantidad_ml) <= 0)
    ) {
      return res.status(400).json({
        message: "La cantidad debe ser un número positivo",
      });
    }

    if (datosActualizados.tipo !== undefined) {
      datosActualizados.tipo = datosActualizados.tipo.trim();
    }

    if (datosActualizados.cantidad_ml === "") {
      datosActualizados.cantidad_ml = null;
    }

    //Actualizar únicamente si la alimentación pertenece al usuario
    let [resultado] = await actualizarAlimentacionModelo(
      id,
      req.usuario.id,
      datosActualizados,
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Alimentación no encontrada",
      });
    }

    res.json({
      message: "Alimentación actualizada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al actualizar alimentación",
    });
  }
};

//Eliminar una alimentación
let eliminarAlimentacion = async (req, res) => {
  try {
    let id = req.params.id;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "El identificador de la alimentación no es válido",
      });
    }

    //Eliminar únicamente si la alimentación pertenece al usuario
    let [resultado] = await eliminarAlimentacionModelo(id, req.usuario.id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: "Alimentación no encontrada",
      });
    }

    res.json({
      message: "Alimentación eliminada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar la alimentación",
    });
  }
};

module.exports = {
  guardarAlimentacion,
  obtenerAlimentaciones,
  obtenerAlimentacionesPorBebe,
  actualizarAlimentacion,
  eliminarAlimentacion,
};
