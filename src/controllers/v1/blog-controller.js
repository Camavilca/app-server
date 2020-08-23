import BlogService from "../../services/v1/Blog.Service";

async function incrementCounterByCode(req, res, next) {
  try {
    const { code } = req.body;

    // TODO: en el futuro
    // tengo que filtrar por IP
    // y poner en la lista negra por un Dia
    // Cada dia se debe crear nuevos documentos...

    const object = await BlogService.incrementCounter(code);

    return res.json({
      ok: true,
      message: "Guardado satisfactorio en la base de datos!",
    });
  } catch (error) {
    next(error);
  }
}

async function findAll(req, res, next) {
  return res.json({ ok: true, message: "" });
}

async function findById(req, res, next) {}

async function updateById(req, res, next) {}

async function deleteById(req, res, next) {}

export default Object.freeze({
  incrementCounterByCode,
  findAll,
  findById,
  updateById,
  deleteById,
});
