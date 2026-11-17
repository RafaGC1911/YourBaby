//Importo las funciones del modelo para poder consultar los usuarios en MySQL.
let { obtenerUsuarioPorNombre } = require("../modelos/usuarios_modelo");

//Importo bcryptjs para comprobar las contraseñas
let bcrypt = require("bcryptjs");

//Importo jsonwebtoken para generar el token de autenticación
let jwt = require("jsonwebtoken");

//Función para iniciar sesión
let iniciarSesion = async (req, res) => {
  try {
    //Obtengo el nombre de usuario y la contraseña enviados desde React
    let { nombre_usuario, contrasena } = req.body;

    //Comprobar que se han enviado los dos campos
    if (!nombre_usuario || !contrasena) {
      return res.status(400).json({
        message: "Debes introducir el nombre de usuario y la contraseña",
      });
    }

    //Busco el usuario en la base de datos utilizando su nombre
    let [usuarios] = await obtenerUsuarioPorNombre(nombre_usuario);

    //Comprobar si existe el usuario
    if (usuarios.length === 0) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    //Guardo los datos del usuario encontrado
    let usuario = usuarios[0];

    /*
    Comparo la contraseña introducida con el hash almacenado en MySQL.
    bcrypt comprueba si coinciden sin necesidad de descifrar el hash.
    */
    let contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena,
    );

    //Si las contraseñas no coinciden, impido el inicio de sesión
    if (!contrasenaCorrecta) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    //Comprobar que existe la clave secreta necesaria para generar el JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("No se ha configurado JWT_SECRET");
    }

    /*
    Genero un token JWT con el identificador y el nombre del usuario.
    El token tendrá una duración de 24 horas.
    */
    let token = jwt.sign(
      {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    /*
    Guardo el token en una cookie httpOnly.
    Así JavaScript en el navegador no puede leer directamente su contenido.
    */
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", //secure exige HTTPS
      sameSite: "lax", //Limita el envío de la cookie en determinadas peticiones entre sitios diferentes.
      maxAge: 24 * 60 * 60 * 1000, //establece duración 24h en milisegundos
    });

    //Informo de que el inicio de sesión se ha realizado correctamente
    return res.status(200).json({
      message: "Inicio de sesión correcto",
      data: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};

/*
Función para cerrar sesión.
Elimino la cookie que contiene el JWT para que el navegador
deje de enviarla en las siguientes peticiones.
*/
let cerrarSesion = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Sesión cerrada correctamente",
  });
};

/*
Función para comprobar si el usuario mantiene una sesión válida.
El middleware ya ha verificado el token y ha guardado sus datos
en req.usuario, por lo que aquí solo tengo que devolverlos.
*/
let verificarSesion = (req, res) => {
  return res.status(200).json({
    message: "Sesión válida",
    data: req.usuario,
  });
};

//Exportar las funciones para utilizarlas desde las rutas
module.exports = {
  iniciarSesion,
  cerrarSesion,
  verificarSesion,
};
