import ScoreService from "../score";
import Postulation from "../../../models/Postulacion";

function PostulationService() {
  return Object.freeze({
    find,
    findPopulateAuthor,
    findSimple,
    findOneSimple,
    updateOne,
    updateById,
  });
}

export default PostulationService();

async function find({ cvId = null, ...args } = {}) {
  let postulation = null;
  postulation = await Postulation.find(args).populate({
    path: "empleo",
    populate: { path: "empresa" },
  });
  if (cvId) {
    let postulationObject = [];
    for await (let p of postulation) {
      let dictionaryId = p.empleo.dictionary || null;
      if (!dictionaryId) {
        postulationObject.push(p.toObject());
        continue;
      } else {
        let scoreObject = await ScoreService.findOne({
          cv: cvId,
          keyword: dictionaryId.toString(),
        });
        if (!scoreObject) {
          postulationObject.push(p.toObject());
          continue;
        }
        let newPostulation = p.toObject();
        newPostulation.score = scoreObject.puntaje;
        postulationObject.push(newPostulation);
      }
    }
    return postulationObject;
  }
  return postulation;
}

async function updateOne(filter, data) {
  return await Postulation.findOneAndUpdate(filter, data);
}

async function updateById(postulation) {
  let newPostulation = null;
  newPostulation = await Postulation.updateOne(
    { _id: postulation._id },
    postulation
  );
  return newPostulation;
}

async function findPopulateAuthor({ ...args } = {}) {
  return await Postulation.find(args).populate({ path: "author" });
}

async function findSimple({ ...args } = {}) {
  return await Postulation.find(args);
}

async function findOneSimple({ ...args } = {}) {
  return await Postulation.findOne(args);
}
