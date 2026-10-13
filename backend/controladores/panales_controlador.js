let {
  crearPanal,
  obtenerPanales: obtenerPanalesModelo,
  obtenerPanalesPorBebe: obtenerPanalesPorBebeModelo,
  actualizarPanal: actualizarPanalModelo,
  eliminarPanal: eliminarPanalModelo,
} = require("../modelos/panales_modelo");


let guardarPanal = async (req, res) => {
  try {
    let { bebe_id, fecha_hora, tipo, observaciones } = req.body;

    if (!bebe_id || !fecha_hora || !tipo) {
      return res.status(400).json({
        mensaje: "El bebé, la fecha y el tipo de pañal son obligatorios",
      });
    }

    let tiposPermitidos = ["pipí", "caca", "mixto"];

    //Controlar que no pongan un tipo no establecido
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        mensaje: "El tipo debe ser pipí, caca o mixto",
      });
    }

    let panal = {
      bebe_id,
      fecha_hora,
      tipo,
      observaciones: observaciones ?? null,
    };

    let [resultado] = await crearPanal(panal);

    return res.status(201).json({
      mensaje: "Registro de pañal creado correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error al crear el registro de pañal:", error);

    return res.status(500).json({
      mensaje: "Error interno al crear el registro de pañal",
    });
  }
};


let obtenerPanales = async (req, res) => {
  try {
    let [panales] = await obtenerPanalesModelo();

    return res.status(200).json(panales);
  } catch (error) {
    console.error("Error al obtener los registros de pañales:", error);

    return res.status(500).json({
      mensaje: "Error interno al obtener los registros",
    });
  }
};


let obtenerPanalesPorBebe = async (req, res) => {
  try {
    let { bebeId } = req.params;

    let [panales] = await obtenerPanalesPorBebeModelo(bebeId);

    return res.status(200).json(panales);
  } catch (error) {
    console.error("Error al obtener los pañales del bebé:", error);

    return res.status(500).json({
      mensaje: "Error interno al obtener los registros del bebé",
    });
  }
};


let actualizarPanal = async (req, res) => {
  try {
    let { id } = req.params;
    let panal = req.body ?? {};

    if (Object.keys(panal).length === 0) {
      return res.status(400).json({
        mensaje: "Debes indicar al menos un campo para actualizar",
      });
    }

    let camposPermitidos = ["bebe_id", "fecha_hora", "tipo", "observaciones"];//Lista blanca para no incluir el id(por ejemplo) de cada registro y que no se pueda modificar

    let camposRecibidos = Object.keys(panal);//Recoger los campos que me envían

    let campoNoPermitido = camposRecibidos.some(
      (campo) => !camposPermitidos.includes(campo),
    );

    if (campoNoPermitido) {
      return res.status(400).json({
        mensaje: "Has enviado algún campo no permitido",
      });
    }

    let tiposPermitidos = ["pipí", "caca", "mixto"];

    if (panal.tipo !== undefined && !tiposPermitidos.includes(panal.tipo)) {
      return res.status(400).json({
        mensaje: "El tipo debe ser pipí, caca o mixto",
      });
    }

    let [resultado] = await actualizarPanalModelo(id, panal);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el registro de pañal",
      });
    }

    return res.status(200).json({
      mensaje: "Registro de pañal actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar el registro de pañal:", error);

    return res.status(500).json({
      mensaje: "Error interno al actualizar el registro",
    });
  }
};

let eliminarPanal = async (req, res) => {
  try {
    let { id } = req.params;

    let [resultado] = await eliminarPanalModelo(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el registro de pañal",
      });
    }

    return res.status(200).json({
      mensaje: "Registro de pañal eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el registro de pañal:", error);

    return res.status(500).json({
      mensaje: "Error interno al eliminar el registro",
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
