import { useState } from "react";

//Formulario para iniciar sesión en YourBaby
function FormularioLogin({ alIniciarSesion }) {
  //Guardo los datos que introduce el usuario
  let [nombreUsuario, setNombreUsuario] = useState("");
  let [contrasena, setContrasena] = useState("");

  //Guardo los mensajes que quiero mostrar en el formulario
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("error");

  //Indico si se está enviando la petición al servidor
  let [cargando, setCargando] = useState(false);

  //Función para enviar las credenciales al backend
  let iniciarSesion = async (e) => {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      //Envío el nombre de usuario y la contraseña al backend
      let response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", //Importante, sin esto no se envía la cookie JWT al backend
        body: JSON.stringify({
          nombre_usuario: nombreUsuario,
          contrasena: contrasena,
        }),
      });

      let responseData = await response.json();

      //Compruebo si el servidor ha rechazado las credenciales
      if (!response.ok) {
        throw new Error(responseData.message || "No se pudo iniciar sesión");
      }

      //Indico que el inicio de sesión se ha realizado correctamente
      setTipoMensaje("exito");
      setMensaje("Inicio de sesión correcto");

      //Comunico a App.jsx que el usuario ya está identificado
      alIniciarSesion(responseData.data);
    } catch (error) {
      //Muestro un mensaje si ocurre algún problema
      setTipoMensaje("error");
      setMensaje(error.message || "No se pudo conectar con el servidor");
    } finally {
      //Finalizo el estado de carga tanto si funciona como si falla
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-login">
      <section className="formulario-login">
        <div className="cabecera-login">
          <h1>YourBaby</h1>
          <p>Tu pequeño mundo, siempre contigo.</p>
        </div>

        <div className="introduccion-login">
          <h2>¡Bienvenidos!</h2>
          <p>Inicia sesión para acceder a tu espacio familiar.</p>
        </div>

        <form onSubmit={iniciarSesion}>
          <div className="campo-login">
            <label htmlFor="nombre_usuario">Nombre de usuario</label>
            <input
              type="text"
              id="nombre_usuario"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="campo-login">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {mensaje && (
            <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>
          )}

          <button type="submit" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default FormularioLogin;
