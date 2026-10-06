let {
  crearBebe,
  obtenerBebes: obtenerBebesModelo, //Esto se hace para importar la función obtenerBebes, pero en este archivo se va a llamar obtenerBebesModelo.
  //De esta forma puedo tener en este archivo el mismo nombre de función.
  obtenerBebeId: obtenerBebeIdModelo,
  actualizarBebe: actualizarBebeModelo,
  eliminarBebe: eliminarBebeModelo
} = require("../modelos/bebes_modelo");

let obtenerBebes = async (req, res) => {
  try {
    let [bebes] = await obtenerBebesModelo(); /**
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

let obtenerBebeId = async (req, res) => {
  try {
    let [bebes] = await obtenerBebeIdModelo(req.params.id);

    if (bebes.length === 0) {
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    res.json({
      message: "Bebé obtenido correctamente",
      data: bebes[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el bebé",
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

let actualizarBebe = async (req, res) => {
  try {
    let [resultado] = await actualizarBebeModelo(req.params.id, req.body); //Pasarle el id para saber qué bebé hay que actualizar y req.body para decir qué datos act

    if (resultado.affectedRows === 0) {
      //Si no hay ninguna fila afectada en el update quiere decir que no existe el id que nos pasan
      return res.status(404).json({
        message: "Bebé no encontrado",
      });
    }

    res.json({
      message: "Bebé actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar al bebé",
    });
  }
};

let eliminarBebe = async (req, res)=>{
  try {
    let [resultado] = await eliminarBebeModelo(req.params.id);

    if(resultado.affectedRows === 0){
      return res.status(404).json({
        message: "Bebé no encontrado"
      });
    }

    res.json({
      message: "Bebé eliminado correctamente"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar el bebé"
    });
  }
}

module.exports = {
  obtenerBebes,
  guardarBebe,
  obtenerBebeId,
  actualizarBebe,
  eliminarBebe
};
