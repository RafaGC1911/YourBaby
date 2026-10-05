let {
  crearBebe,
  obtenerBebes: obtenerBebesModelo, //Esto se hace para importar la función obtenerBebes, pero en este archivo se va a llamar obtenerBebesModelo.
  //De esta forma puedo tener en este archivo el mismo nombre de función
} = require("../modelos/bebes_modelo");

let obtenerBebes = async (req, res) => {
  try {
    let [bebes] = await obtenerBebesModelo();/**
    Obtener la primera posición del array que devuelve la función. Esta es la que trae la información que quiero
    */
    res.json({
      message: "Bebés obtenidos correctamente",
      data: bebes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al intentar obtener la lista de bebés",
    });
  }
};

let guardarBebe = async (req, res) => {
  try {
    /**
     * La función crearBebe devuelve internamente un array de 2 elementos:
     * Elemento 1: filas afectadas en la inserción, columnas, etc... Y el atributo insertId, que es el que me interesa para usar luego
     * Elemento 2: metadatos
     * Por [resultado], esta sintaxis se usa para guardar en una variable resultado el primer elemento del array que devuelve crearBebe.
     */
    let [resultado] = await crearBebe(req.body);

    res.status(201).json({
      message: "Bebé creado correctamente",
      data: {
        id: resultado.insertId,
        ...req.body,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al crear el bebé",
    });
  }
};

module.exports = {
  obtenerBebes,
  guardarBebe,
};
