import { useState } from "react";

//Formulario para registrar una nueva cuenta en YourBaby
function FormularioRegistro({ alVolverLogin }) {
  //Guardo los datos que introduce el usuario
  let [nombreUsuario, setNombreUsuario] = useState("");
  let [correoElectronico, setCorreoElectronico] = useState("");
  let [contrasena, setContrasena] = useState("");
  let [confirmarContrasena, setConfirmarContrasena] = useState("");

  //Guardo los mensajes que quiero mostrar en el formulario
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("error");

  //Indico si se está enviando la petición al servidor
  let [cargando, setCargando] = useState(false);

  //Función para enviar los datos del nuevo usuario al backend
  let registrarUsuario = async (e) => {
    e.preventDefault();

    setMensaje("");

    //Compruebo que las dos contraseñas introducidas coincidan
    if (contrasena !== confirmarContrasena) {
      setTipoMensaje("error");
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    //Compruebo que la contraseña tenga al menos 8 caracteres
    if (contrasena.length < 8) {
      setTipoMensaje("error");
      setMensaje("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setCargando(true);

    try {
      /*
      Envío los datos al endpoint de registro.
      No envío la confirmación de contraseña porque solo la utilizo
      en React para comprobar que el usuario ha escrito ambas igual.
      */
      let response = await fetch("http://localhost:3000/api/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nombre_usuario: nombreUsuario.trim(),
          correo_electronico: correoElectronico.trim(),
          contrasena: contrasena,
        }),
      });

      let responseData = await response.json();

      //Compruebo si el servidor ha rechazado el registro
      if (!response.ok) {
        throw new Error(responseData.message || "No se pudo crear la cuenta");
      }

      //Informo de que la cuenta se ha creado correctamente
      setTipoMensaje("exito");
      setMensaje("Cuenta creada correctamente. Ya puedes iniciar sesión.");

      //Limpio los campos después de completar el registro
      setNombreUsuario("");
      setCorreoElectronico("");
      setContrasena("");
      setConfirmarContrasena("");
    } catch (error) {
      //Muestro un mensaje si ocurre algún problema durante el registro
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
          <h2>Crear una cuenta</h2>
          <p>Regístrate para empezar a utilizar YourBaby.</p>
        </div>

        <form onSubmit={registrarUsuario}>
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
            <label htmlFor="correo_electronico">Correo electrónico</label>
            <input
              type="email"
              id="correo_electronico"
              value={correoElectronico}
              onChange={(e) => setCorreoElectronico(e.target.value)}
              autoComplete="email"
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
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          <div className="campo-login">
            <label htmlFor="confirmar_contrasena">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmar_contrasena"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          {mensaje && (
            <p className={`mensaje mensaje-${tipoMensaje}`}>{mensaje}</p>
          )}

          <button type="submit" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <button
          type="button"
          className="boton-secundario-login"
          onClick={alVolverLogin}
        >
          Volver al inicio de sesión
        </button>
      </section>
    </div>
  );
}

export default FormularioRegistro;
