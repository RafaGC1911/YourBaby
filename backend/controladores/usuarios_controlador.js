//Importo las funciones del modelo para poder consultar y crear usuarios en MySQL.
let {
  obtenerUsuarioPorNombre,
  comprobarUsuarioExistente,
  crearUsuario,
} = require("../modelos/usuarios_modelo");

//Importo bcryptjs para cifrar las contraseñas antes de guardarlas
let bcrypt = require("bcryptjs");

//Importo jsonwebtoken para generar el token de autenticación
let jwt = require("jsonwebtoken");

//Función para registrar un nuevo usuario
let registrarUsuario = async (req, res) => {
  try {
    //Obtengo los datos enviados desde el formulario de registro de React
    let { nombre_usuario, correo_electronico, contrasena } = req.body;

    //Compruebo que se hayan enviado todos los campos obligatorios
    if (!nombre_usuario || !correo_electronico || !contrasena) {
      return res.status(400).json({
        message: "Debes completar todos los campos",
      });
    }

    //Elimino los espacios sobrantes al principio y al final de los datos
    nombre_usuario = nombre_usuario.trim();
    correo_electronico = correo_electronico.trim().toLowerCase();

    //Compruebo que los campos no estén vacíos después de eliminar los espacios
    if (!nombre_usuario || !correo_electronico || !contrasena.trim()) {
      return res.status(400).json({
        message: "Debes completar todos los campos",
      });
    }

    //Compruebo que el correo tenga un formato válido
    let formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correo_electronico)) {
      return res.status(400).json({
        message: "Introduce un correo electrónico válido",
      });
    }

    //Compruebo que la contraseña tenga al menos 8 caracteres
    if (contrasena.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    //Compruebo si el nombre de usuario o el correo ya están registrados
    let [usuariosExistentes] = await comprobarUsuarioExistente(
      nombre_usuario,
      correo_electronico,
    );

    if (usuariosExistentes.length > 0) {
      //Compruebo qué dato está duplicado para mostrar un mensaje más concreto
      let nombreOcupado = usuariosExistentes.some(
        (usuario) => usuario.nombre_usuario === nombre_usuario,
      );

      let correoOcupado = usuariosExistentes.some(
        (usuario) => usuario.correo_electronico === correo_electronico,
      );

      if (nombreOcupado) {
        return res.status(409).json({
          message: "Este nombre de usuario ya está registrado",
        });
      }

      if (correoOcupado) {
        return res.status(409).json({
          message: "Este correo electrónico ya está registrado",
        });
      }
    }

    /*
    Genero un hash de la contraseña utilizando bcrypt.
    El número 10 indica el coste del proceso de cifrado.
    Nunca guardo la contraseña original en la base de datos.
    */
    let contrasenaHasheada = await bcrypt.hash(contrasena, 10);

    //Preparo el objeto con los datos que voy a guardar en MySQL
    let nuevoUsuario = {
      nombre_usuario,
      correo_electronico,
      contrasena: contrasenaHasheada,
    };

    //Creo el usuario utilizando la función del modelo
    let [resultado] = await crearUsuario(nuevoUsuario);

    return res.status(201).json({
      message: "Cuenta creada correctamente",
      data: {
        id: resultado.insertId,
        nombre_usuario,
        correo_electronico,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    //Compruebo si MySQL detecta un duplicado aunque haya pasado la validación previa
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "El nombre de usuario o el correo ya están registrados",
      });
    }

    return res.status(500).json({
      message: "Error al registrar la cuenta",
    });
  }
};

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
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
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  verificarSesion,
};
