import Blog from "../../models/Blog";

async function create(data) {
  return Blog.create(data);
}

async function findAll(params) {
  return res.json({ ok: true, message: "findAll" });
}

async function findById(id) {}

async function updateById(id) {}

async function incrementCounter(code) {
  const COUNTER_VALUE = 1;
  let blog = await Blog.findOne({ code: code });

  if (!blog) {
    blog = await this.create({
      code,
    });
  }

  blog.counter += COUNTER_VALUE;
  let result = await blog.save();
  return result;
}

async function deleteById(id) {}

export default Object.freeze({
  create,
  findAll,
  findById,
  updateById,
  incrementCounter,
  deleteById,
});
