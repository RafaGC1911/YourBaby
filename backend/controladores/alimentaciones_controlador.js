let {
  crearAlimentacion,
  obtenerAlimentaciones: obtenerAlimentacionesModelo,
  obtenerAlimentacionesPorBebe: obtenerAlimentacionesPorBebeModelo,
  actualizarAlimentacion: actualizarAlimentacionModelo,
  eliminarAlimentacion: eliminarAlimentacionModelo,
} = require("../modelos/alimentaciones_modelo");

let guardarAlimentacion = async (req, res) => {
  try {
    let [resultado] = await crearAlimentacion(req.body);

    res.status(201).json({
      message: "Alimentación registrada correctamente",
      data: {
        id: resultado.insertId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al registrar la alimentación",
    });
  }
};

let obtenerAlimentaciones = async (req, res) => {
  try {
    let [alimentaciones] = await obtenerAlimentacionesModelo();
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

let obtenerAlimentacionesPorBebe = async (req, res) => {
  try {
    let bebeId = req.params.bebeId;
    let [alimentaciones] = await obtenerAlimentacionesPorBebeModelo(bebeId);
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

let actualizarAlimentacion = async (req, res) => {
  try {
    let id = req.params.id;
    let alimentacion = req.body;

    //Comprobar si el usuario ha enviado un objeto vacío
    //Object.keys() obtiene las propiedades del objeto. Si no hay ninguna, su longitud será 0.
    //De forma que si esto pasa, respondo con petición no válida(400) y evito que el modelo genere una consulta vacía
    if (Object.keys(alimentacion).length === 0) {
      return res.status(400).json({
        message: "Debes rellenar al menos un campo",
      });
    }

    let [resultado] = await actualizarAlimentacionModelo(id, alimentacion);

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

let eliminarAlimentacion = async (req, res) => {
  try {
    let id = req.params.id;
    let [resultado] = await eliminarAlimentacionModelo(id);

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
  eliminarAlimentacion
};
