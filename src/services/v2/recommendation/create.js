import Recommendation from "../../../models/Recommendation";
async function create({ author = null, type = null }) {
  if (!author || !type) {
    throw new Error("Author and type field required");
  }
  let newRecommendation = await Recommendation.create({ author, type });
  return newRecommendation;
}

export default create;
