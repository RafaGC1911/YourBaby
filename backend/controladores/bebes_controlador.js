let obtenerBebes = (req, res) => {
  console.log(req.method);
  console.log(req.url);

  res.json({
    message: "Lista de bebés",
  });
};

let crearBebe = (req, res) => {
  console.log(req.body);

  res.json({
    message: "Bebé recibido",
    data: req.body,
  });
};

module.exports = {
  obtenerBebes,
  crearBebe,
};
