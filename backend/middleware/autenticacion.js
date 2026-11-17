/*
Importo jsonwebtoken para comprobar que el token recibido
es válido y que no ha caducado.
*/
let jwt = require("jsonwebtoken");

//Middleware para comprobar la autenticación del usuario
let verificarToken = (req, res, next) => {
  try {
    //Obtengo el token que el navegador envía mediante la cookie
    let token = req.cookies.token;

    //Compruebo que exista un token
    if (!token) {
      return res.status(401).json({
        message: "Debes iniciar sesión para acceder a esta sección",
      });
    }

    /*
    Verifico el token utilizando la misma clave secreta
    que utilicé para generarlo durante el inicio de sesión.
    */
    let datosToken = jwt.verify(token, process.env.JWT_SECRET);

    /*
    Guardo los datos del usuario en la petición para que
    los siguientes controladores puedan utilizarlos.
    */
    req.usuario = datosToken;

    //Permito que la petición continúe hacia la siguiente función
    next();
  } catch (error) {
    //Si el token no es válido o ha caducado, rechazo la petición
    return res.status(401).json({
      message: "La sesión no es válida o ha caducado",
    });
  }
};

//Exporto el middleware para utilizarlo en las rutas protegidas
module.exports = verificarToken;
