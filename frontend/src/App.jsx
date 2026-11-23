import "./App.css";
import { useState, useEffect } from "react";
import Cabecera from "./componentes/Cabecera.jsx";
import TarjetaBebe from "./componentes/TarjetaBebe.jsx";
import FormularioBebe from "./componentes/FormularioBebe.jsx";
import FormularioEdicionBebe from "./componentes/FormularioEdicionBebe.jsx";
import SeccionAlimentaciones from "./componentes/SeccionAlimentaciones.jsx";
import SeccionSuenos from "./componentes/SeccionSuenos.jsx";
import SeccionPanales from "./componentes/SeccionPanales.jsx";
import SeccionPesos from "./componentes/SeccionPesos";
import FormularioLogin from "./componentes/FormularioLogin.jsx";

function App() {
  /*Estados de variables*/

  //Guardo los datos del usuario que ha iniciado sesión
  let [usuario, setUsuario] = useState(null);

  //Indico si estoy comprobando si existe una sesión válida
  let [comprobandoSesion, setComprobandoSesion] = useState(true);

  let [bebes, setBebes] = useState([]);
  let [mensaje, setMensaje] = useState("Cargando bebés...");

  //Guardo que sección está abierta y el ID del bebé seleccionado.
  //Si tipo vale null, significa que no estamos dentro de ninguna sección.
  let [seccionActiva, setSeccionActiva] = useState({
    tipo: null,
    bebeId: null,
  });

  //Busco en la lista el bebé cuyo ID coincide con el que he seleccionado.
  //Si no hay ninguno seleccionado, el resultado será undefined.
  let bebeSeleccionado = bebes.find((bebe) => bebe.id === seccionActiva.bebeId);

  /*
  Función para comprobar si el navegador conserva una sesión válida.
  El backend verifica la cookie JWT y devuelve los datos del usuario
  si el token sigue siendo válido.
  */
  let verificarSesion = async () => {
    try {
      let response = await fetch("http://localhost:3000/api/auth/verificar", {
        credentials: "include",
      });

      //Si no existe una sesión válida, dejo al usuario sin identificar
      if (!response.ok) {
        setUsuario(null);
        return;
      }

      let responseData = await response.json();

      //Guardo los datos del usuario que devuelve el backend
      setUsuario(responseData.data);

      //Una vez identificado, cargo los bebés de la familia
      await actualizarBebes();
    } catch (error) {
      console.error("Error al comprobar la sesión:", error);
      setUsuario(null);
    } finally {
      //Indico que ya he terminado de comprobar la sesión
      setComprobandoSesion(false);
    }
  };

  //Funciones que reciben el ID que le envía la tarjeta y lo guardan en el estado para que React sepa qué sección debe mostrar.

  //Guardo el ID del bebé que quiero editar y activo el formulario de edición.
  let seleccionarBebe = (id) => {
    setSeccionActiva({
      tipo: "edicion",
      bebeId: id,
    });
  };

  //Abro la sección de alimentaciones del bebé seleccionado.
  let verAlimentaciones = (id) => {
    setSeccionActiva({
      tipo: "alimentaciones",
      bebeId: id,
    });
  };

  //Abro la sección de sueño del bebé seleccionado.
  let verSuenos = (id) => {
    setSeccionActiva({
      tipo: "suenos",
      bebeId: id,
    });
  };

  //Abro la sección de pañales del bebé seleccionado.
  let verPanales = (id) => {
    setSeccionActiva({
      tipo: "panales",
      bebeId: id,
    });
  };

  //Abro la sección de pesos del bebé seleccionado.
  let verPesos = (id) => {
    setSeccionActiva({
      tipo: "pesos",
      bebeId: id,
    });
  };

  //Cierro cualquier sección abierta y vuelvo a la pantalla principal.
  let volverInicio = () => {
    setSeccionActiva({
      tipo: null,
      bebeId: null,
    });
  };

  //Función para volver a cargar los bebés después de registrar uno nuevo.
  let actualizarBebes = async () => {
    try {
      let response = await fetch("http://localhost:3000/api/bebes", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudieron actualizar los bebés");
      }

      let responseData = await response.json();

      setBebes(responseData.data);

      //Limpio el mensaje cuando la actualización se realiza correctamente
      setMensaje("");
    } catch (error) {
      setMensaje("Error al actualizar los bebés");
    }
  };

  //Eliminar un bebé
  let eliminarBebe = async (id) => {
    setMensaje("");

    //Pedimos confirmación antes de borrar el bebé.
    let confirmar = window.confirm("¿Eliminar este bebé?");

    //Si el usuario cancela, sale
    if (!confirmar) {
      return;
    }

    try {
      let response = await fetch(`http://localhost:3000/api/bebes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let responseData = await response.json();

      //Si el servidor devuelve un error, lo muestra
      if (!response.ok) {
        throw new Error(responseData.message || "No se pudo eliminar el bebé.");
      }

      //Volver a pedir la lista actualizada al servidor.
      await actualizarBebes();
    } catch (error) {
      console.error("Error al eliminar el bebé:", error);
      setMensaje("Error al eliminar el bebé");
    }
  };

  /*
  Función para cerrar la sesión del usuario.
  Envío una petición al backend para eliminar la cookie JWT
  y después limpio los estados de React.
  */
  let cerrarSesion = async () => {
    try {
      let response = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión");
      }

      //Limpio los datos que estaban cargados en React
      setUsuario(null);
      setBebes([]);
      setMensaje("");
      volverInicio();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setMensaje("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  };

  //Compruebo si existe una sesión cuando se carga la aplicación
  useEffect(() => {
    verificarSesion();
  }, []);

  /******* RENDERIZADO *******/

  //Mientras compruebo la sesión, no muestro el contenido de la aplicación
  if (comprobandoSesion) {
    return (
      <div className="contenedor-principal">
        <p>Comprobando sesión...</p>
      </div>
    );
  }

  //Si no existe un usuario identificado, muestro el formulario de login
  if (!usuario) {
    return (
      <FormularioLogin
        alIniciarSesion={(datosUsuario) => {
          setUsuario(datosUsuario);
          actualizarBebes();
        }}
      />
    );
  }

  //Si existe una sesión válida, muestro la aplicación
  return (
    <div className="contenedor-principal">
      {/*CABECERA*/}
      <Cabecera />

     

      <main>
        {/*Si no hay ninguna sección abierta, muestro la pantalla principal.*/}
        {seccionActiva.tipo === null && (
          <div>
            {/*FORMULARIO DE REGISTRO*/}
            <section className="seccion-formulario">
              <FormularioBebe alRegistrar={actualizarBebes} />
            </section>

            {/*TARJETAS DE LOS BEBÉS*/}
            <section className="seccion-bebes">
              <h2>Bebés registrados</h2>

              {mensaje !== "" && <p>{mensaje}</p>}

              <div className="lista-bebes">
                {bebes.map((bebe) => (
                  <TarjetaBebe
                    key={bebe.id}
                    id={bebe.id}
                    nombre={bebe.nombre}
                    fechaNacimiento={bebe.fecha_nacimiento}
                    pesoNacimiento={bebe.peso_nacimiento}
                    alEditar={seleccionarBebe}
                    alEliminar={eliminarBebe}
                    alVerAlimentaciones={verAlimentaciones}
                    alVerSuenos={verSuenos}
                    alVerPanales={verPanales}
                    alVerPesos={verPesos}
                  />
                ))}

                {bebes.length === 0 && mensaje === "" && (
                  <p>No hay bebés registrados</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/*Si hay una sección activa, muestro únicamente el módulo seleccionado.*/}

        {seccionActiva.tipo === "edicion" && bebeSeleccionado && (
          <FormularioEdicionBebe
            key={bebeSeleccionado.id}
            bebe={bebeSeleccionado}
            alGuardar={actualizarBebes}
            alCancelar={volverInicio}
          />
        )}

        {seccionActiva.tipo === "alimentaciones" && bebeSeleccionado && (
          <SeccionAlimentaciones
            key={bebeSeleccionado.id}
            nombreBebe={bebeSeleccionado.nombre}
            bebeId={bebeSeleccionado.id}
            alCerrar={volverInicio}
          />
        )}

        {seccionActiva.tipo === "suenos" && bebeSeleccionado && (
          <SeccionSuenos
            key={bebeSeleccionado.id}
            nombreBebe={bebeSeleccionado.nombre}
            bebeId={bebeSeleccionado.id}
            alCerrar={volverInicio}
          />
        )}

        {seccionActiva.tipo === "panales" && bebeSeleccionado && (
          <SeccionPanales
            key={bebeSeleccionado.id}
            nombreBebe={bebeSeleccionado.nombre}
            bebeId={bebeSeleccionado.id}
            alCerrar={volverInicio}
          />
        )}

        {seccionActiva.tipo === "pesos" && bebeSeleccionado && (
          <SeccionPesos
            key={bebeSeleccionado.id}
            nombreBebe={bebeSeleccionado.nombre}
            bebeId={bebeSeleccionado.id}
            alCerrar={volverInicio}
          />
        )}
      </main>

       {/*Botón para cerrar la sesión*/}
      <div className="zona-cerrar-sesion">
        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
    
  );
}

export default App;
