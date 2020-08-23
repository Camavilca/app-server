import PostulationService from "../../services/v1/Postulation.Service";

async function create() {}
async function getAll() {}
async function updateById(req, res) {
  try {
    const postulation = req.body;
    const newPostulation = await PostulationService.updateById(postulation);
    return res.json({
      ok: true,
      data: newPostulation,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      ok: false,
      data: "Error al actualizar la postulación",
    });
  }
}
async function deleteById() {}

export default {
  create,
  getAll,
  updateById,
  deleteById,
};
