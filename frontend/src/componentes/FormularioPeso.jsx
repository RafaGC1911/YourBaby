
import { useState } from "react";

function FormularioPeso(props) {
  let [peso, setPeso] = useState("");
  let [fecha, setFecha] = useState("");
  let [observaciones, setObservaciones] = useState("");

  //Obtener la fecha actual para impedir seleccionar días futuros
  let ahora = new Date();
  let fechaMaxima = `${ahora.getFullYear()}-${String(
    ahora.getMonth() + 1,
  ).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;

  //Registrar una nueva medición de peso
  let registrarPeso = async (e) => {
    e.preventDefault();

    try {
      let response = await fetch("http://localhost:3000/api/pesos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bebe_id: Number(props.bebeId),
          peso: Number(peso),
          fecha,
          observaciones: observaciones.trim() || null,
        }),
      });

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      setPeso("");
      setFecha("");
      setObservaciones("");

      props.alMensaje("Medición registrada correctamente", "exito");

      await props.alRegistrar();
    } catch (error) {
      console.error("Error al registrar el peso:", error);
      props.alMensaje("No se pudo registrar la medición", "error");
    }
  };

  return (
    <form className="formulario-peso" onSubmit={registrarPeso}>
      <h3>Registrar peso</h3>

      <div className="campo-peso">
        <label htmlFor="peso">Peso (kg)</label>
        <input
          type="number"
          id="peso"
          min="0.001"
          max="29.999"
          step="0.001"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Ej. 4.250"
          required
        />
      </div>

      <div className="campo-peso">
        <label htmlFor="fecha-peso">Fecha</label>
        <input
          type="date"
          id="fecha-peso"
          value={fecha}
          max={fechaMaxima}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div className="campo-peso">
        <label htmlFor="observaciones-peso">Observaciones</label>
        <textarea
          id="observaciones-peso"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones opcionales..."
        />
      </div>

      <button type="submit" className="boton-guardar-peso">
        Registrar peso
      </button>
    </form>
  );
}

export default FormularioPeso;
