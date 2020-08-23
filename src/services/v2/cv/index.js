import upsert from "./upsert";
import setScore from "./set-score";
import Cv from "../../../models/Cv";

function CvService() {
  return Object.freeze({
    upsert,
    setScore,
    find,
    findOne,
  });
}
export default CvService();

async function find({ ...args } = {}) {
  let cvs = null;
  cvs = await Cv.find(args).populate({ path: "puntajes" });
  return cvs;
}

async function findOne({ ...args } = {}) {
  let cv = null;
  cv = await Cv.findOne(args);
  return cv;
}
