import { useState, useEffect } from "react";
import Cabecera from "./componentes/Cabecera.jsx";
import TarjetaBebe from "./componentes/TarjetaBebe.jsx";
import FormularioBebe from "./componentes/FormularioBebe.jsx";

function App() {
  let [bebes, setBebes] = useState([]);
  let [mensaje, setMensaje] = useState("Cargando bebés...");

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

  return (
    <div>
      <Cabecera />

      <FormularioBebe/>

      <h2>Bebés registrados</h2>

      {mensaje !== "" && <p>{mensaje}</p>}

      {bebes.map((bebe) => (
        <TarjetaBebe
        key={bebe.id}//key es una propiedad especial que React utiliza para identificar cada elemento dentro de una lista.
        nombre={bebe.nombre}
        fechaNacimiento = {bebe.fecha_nacimiento}
        pesoNacimiento = {bebe.peso_nacimiento}
        />
      ))}
    </div>
  );
}

export default App;
