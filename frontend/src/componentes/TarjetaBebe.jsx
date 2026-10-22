function TarjetaBebe(props){
  return(
    <article>
      <h3>{props.nombre}</h3>
      <p>Fecha de nacimiento: {props.fechaNacimiento}</p>
      <p>Peso al nacer: {props.pesoNacimiento} gramos</p>
    </article>
  );
}
export default TarjetaBebe;