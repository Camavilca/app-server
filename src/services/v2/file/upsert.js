import File from "./../../../models/Archivo";

async function upsert(
  { author = null, name = null, type = null, state = null, path = null },
  options = null
) {
  if (!name || !author) {
    throw new Error("Name or author field are mandatory");
  }
  let result = await File.findOneAndUpdate(
    { author },
    {
      author,
      nombre: name,
      tipo: type,
      estado: state,
      ruta: path,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return result;
}

export default upsert;
