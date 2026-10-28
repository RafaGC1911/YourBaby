import "./App.css";
import { useState, useEffect } from "react";
import Cabecera from "./componentes/Cabecera.jsx";
import TarjetaBebe from "./componentes/TarjetaBebe.jsx";
import FormularioBebe from "./componentes/FormularioBebe.jsx";
import FormularioEdicionBebe from "./componentes/FormularioEdicionBebe.jsx";

function App() {
  /*Estados de variables*/
  let [bebes, setBebes] = useState([]); //bebes contiene la lista actual, setBebes sirve para actualizar esa lista.
  let [mensaje, setMensaje] = useState("Cargando bebés...");

  //Guarda el ID del bebé que quiero editar.
  //Si vale null, significa que no estamos editando ninguno.
  let [bebeEditando, setBebeEditando] = useState(null);

  //Buscar en la lista el bebé cuyo ID he seleccionado.
  //Si no hay ninguno seleccionado, el resultado será undefined.
  let bebeSeleccionado = bebes.find((bebe) => bebe.id === bebeEditando);

  //Función que recibe el ID que le envía la tarjeta y lo guarda en el estado.
  let seleccionarBebe = (id) => {
    setBebeEditando(id);
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
        setMensaje("Error al cargar los bebés: " + error.message);
      }
    }

    obtenerBebes();
  }, []);

  /*******RENDERIZADO******** */
  return (
    //CABECERA
    <div className="contenedor-principal">
      <Cabecera />
      <main>
        {/**FORMULARIO */}
        <section className="seccion-formulario">
          <FormularioBebe alRegistrar={actualizarBebes} />
        </section>

        {/**TARJETAS BEBÉS */}
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
                //conectar el botón editar con la función seleccionarBebe
                alEditar={seleccionarBebe}
              />
            ))}
          </div>

          {/*Solo mostrar el formulario si se ha seleccionado un bebé */}
          {bebeSeleccionado && (
            <FormularioEdicionBebe
              key={bebeSeleccionado.id}
              bebe={bebeSeleccionado}
              alGuardar = {actualizarBebes}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
