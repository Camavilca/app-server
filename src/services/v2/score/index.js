import Score from "./../../../models/Puntaje";

function ScoreService() {
  return Object.freeze({
    create,
    find,
    findOne,
    upsert,
  });
}
export default ScoreService();

async function find({ ...args } = {}) {
  let score = null;
  score = Score.find(args);
  return score;
}

async function findOne({ ...args } = {}) {
  let score = null;
  score = Score.findOne(args);
  return score;
}

async function create(data) {
  const newScore = await Score.create({
    keyword: data.dictionaryId || null,
    cv: data.cvId || null,
    puntaje: data.score,
  });
  return newScore;
}

async function upsert(data) {
  const score = await Score.findOneAndUpdate(
    { keyword: data.dictionaryId, cv: data.cvId },
    {
      keyword: data.dictionaryId || null,
      cv: data.cvId || null,
      puntaje: data.score,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return score;
}
