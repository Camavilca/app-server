import CvDetails from "../../../models/Cv";

async function upsert({
  author = null,
  id = null,
  nombre = null,
  correo = null,
  telefono = null,
  grado = null,
  universidad = null,
  words = null,
  goodwords = null,
  puntajes = null,
}) {
  // Si no encuentra el documento lo creará, si lo encuentra lo actualizará
  let cvDetail = await CvDetails.findOneAndUpdate(
    { author },
    {
      author,
      id,
      nombre,
      correo,
      telefono,
      grado,
      universidad,
      words,
      goodwords,
      puntajes,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return cvDetail;
}

export default upsert;
