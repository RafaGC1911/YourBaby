let {
  crearAlimentacion,
  obtenerAlimentaciones: obtenerAlimentacionesModelo,
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

module.exports = { guardarAlimentacion, obtenerAlimentaciones };
