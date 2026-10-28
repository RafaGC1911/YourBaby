import { useState } from "react";

function FormularioEdicionBebe(props) {
  //Cargar los datos actuales del bebé seleccionado en los estados.
  let [nombre, setNombre] = useState(props.bebe.nombre);
  let [fechaNacimiento, setFechaNacimiento] = useState(
    props.bebe.fecha_nacimiento.slice(0, 10),
  );

  /**La API puede devolver una fecha como 2026-07-03T22:00:00.000Z,
   *pero un campo type="date" necesita el formato 2026-07-03. slice(0, 10) toma los primeros diez caracteres. */
  let [pesoNacimiento, setPesoNacimiento] = useState(
    (props.bebe.peso_nacimiento / 1000).toFixed(3),
  );
  let [mensaje, setMensaje] = useState("");
  let [tipoMensaje, setTipoMensaje] = useState("");

  //Función para gestionar el envío del formulario de edición.
  let gestionarEdicion = async (e) => {
    e.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    //Comprobar que todos los campos estén rellenados.
    if (
      nombre.trim() === "" ||
      fechaNacimiento === "" ||
      pesoNacimiento.trim() === ""
    ) {
      setMensaje("Debes rellenar todos los campos.");
      setTipoMensaje("error");
      return;
    }

    //Comprobar que el peso tenga el formato esperado, por ejemplo 3.550.
    if (!/^\d{1,2}\.\d{3}$/.test(pesoNacimiento)) {
      setMensaje(
        "Introduce el peso en el formato indicado, por ejemplo 3.550.",
      );
      setTipoMensaje("error");
      return;
    }

    //Convertir el peso escrito en kilos a gramos enteros.
    //Por ejemplo 3.550 se convierte en 3550.
    let pesoEnGramos = Number(pesoNacimiento.replace(".", ""));

    if (pesoEnGramos <= 0 || pesoEnGramos > 10000) {
      setMensaje("El peso debe ser mayor que cero y no superar los 10 kg.");
      setTipoMensaje("error");
      return;
    }

    //Preparar los datos que se envian al backend.
    let bebeActualizado = {
      nombre: nombre.trim(),
      fecha_nacimiento: fechaNacimiento,
      peso_nacimiento: pesoEnGramos,
    };

    try {
      let response = await fetch(
        `http://localhost:3000/api/bebes/${props.bebe.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bebeActualizado),
        },
      );

      let responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "No se pudieron guardar los cambios.",
        );
      }

      setMensaje("Los cambios se han guardado correctamente.");
      setTipoMensaje("exito");

      //Avisar a App.jsx para que actualice la lista de bebés.
      props.alGuardar();
    } catch (error) {
      console.error("Error al actualizar el bebé:", error);
      setMensaje(error.message || "No se pudieron guardar los cambios.");
      setTipoMensaje("error");
    }
  };

  //*******RENDERIZADO */
  return (
    <section className="formulario-bebe">
      <h3>Editar bebé: {props.bebe.nombre}</h3>

      {/**Mostrar mensaje de éxito o error */}
      {mensaje !== "" && (
        <p
          className={
            tipoMensaje === "error" ? "mensaje-error" : "mensaje-exito"
          }
        >
          {mensaje}
        </p>
      )}

      <form className="formulario-bebe-campos" onSubmit={gestionarEdicion}>
        <label>
          Nombre:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>

        <label>
          Fecha de nacimiento:
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </label>

        <label>
          Peso al nacer (kg):
          <input
            type="text"
            inputMode="decimal"
            value={pesoNacimiento}
            onChange={(e) => setPesoNacimiento(e.target.value)}
          />
        </label>

        <button type="submit">Guardar cambios</button>
      </form>
    </section>
  );
}

export default FormularioEdicionBebe;
