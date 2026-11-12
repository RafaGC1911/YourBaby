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

function App() {
  /*Estados de variables*/
  let [bebes, setBebes] = useState([]); //bebes contiene la lista actual, setBebes sirve para actualizar esa lista.
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
      let response = await fetch("http://localhost:3000/api/bebes");

      if (!response.ok) {
        throw new Error("No se pudieron actualizar los bebés");
      }

      let responseData = await response.json();

      setBebes(responseData.data);
    } catch (error) {
      setMensaje(`Error al actualizar los bebés ${error.message}`);
    }
  };

  //Eliminar un bebé
  let eliminarBebe = async (id) => {
    setMensaje("");
    // Pedimos confirmación antes de borrar el bebé.
    let confirmar = window.confirm("¿Eliminar este bebé?");

    //Si el usuario cancela, sale
    if (!confirmar) {
      return;
    }

    try {
      let response = await fetch(`http://localhost:3000/api/bebes/${id}`, {
        method: "DELETE",
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
      setMensaje(`Error al eliminar el bebé`);
    }
  };

  useEffect(() => {
    async function obtenerBebes() {
      try {
        //La API contesta con un objeto cuyas propiedades son message, y data. Este último contiene un array de objetos
        let response = await fetch("http://localhost:3000/api/bebes");

        if (!response.ok) {
          throw new Error("No se pudieron obtener los bebés");
        }

        //He llamado responseData al objeto completo para distinguirlo de data que es la propiedad que contiene el array de bebés que viene de la api
        let responseData = await response.json();

        setBebes(responseData.data);
        setMensaje("");
      } catch (error) {
        setMensaje("Error al cargar los bebés");
      }
    }

    obtenerBebes();
  }, []);

  /*******RENDERIZADO*******/
  return (
    //CABECERA
    <div className="contenedor-principal">
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
    </div>
  );
}

export default App;
