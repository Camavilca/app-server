import Cv from "../../models/Cv";

async function create(data) {
  let newCv = await Cv.create(data);
  return newCv;
}

async function findAll() {
  let cvs = await Cv.find();
  return cvs;
}

async function findOne(id) {
  let cv = await Cv.findOne(id);
  return cv;
}

async function updateById(id, data) {
  let updatedCv = await Cv.updateById(id, data);
  return updatedCv;
}

async function deleteById(id) {
  let result = await Cv.deleteById(id);
  return result;
}

export default {
  create,
  findAll,
  findOne,
  updateById,
  deleteById,
};
