import Postulacion from "../../models/Postulacion";

async function create() {}

async function updateById(postulation) {
  const { id } = postulation;
  return await Postulacion.findByIdAndUpdate({ _id: id }, postulation);
}

async function getAll() {}

async function deleteById() {}

export default { create, getAll, updateById, deleteById };
