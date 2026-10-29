function SeccionAlimentaciones(props) {
  return (
    <section className="seccion-alimentaciones">
      <h2>Alimentaciones de {props.nombreBebe}</h2>

      <p>Aquí aparecerán las alimentaciones registradas de este bebé.</p>

      <button type="button" onClick={props.alCerrar}>
        Cerrar alimentaciones
      </button>
    </section>
  );
}

export default SeccionAlimentaciones;
