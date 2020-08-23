import File from "./../../../models/Archivo";

async function create(
  { author = null, name = null, type = null, state = null, path = null },
  options = null
) {
  if (!name || !author) {
    throw new Error("Name or author field are mandatory");
  }
  let result = await File.create({
    author,
    nombre: name,
    tipo: type,
    estado: state,
    ruta: path,
  });

  return result;
}

export default create;
