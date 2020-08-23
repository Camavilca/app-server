import RecommendEmployment from "../../../models/RecommendEmployment";

function RecommendEmploymentService() {
  return Object.freeze({
    find,
    findPopulate,
    createMany,
    removeOne,
    updateOne,
    updatePreference,
  });
}

export default RecommendEmploymentService();

async function find({ ...args } = {}) {
  return await RecommendEmployment.find(args);
}

async function removeOne({ ...args } = {}) {
  return await RecommendEmployment.deleteOne(args);
}

async function updateOne({ ...args } = {}) {
  return await RecommendEmployment.updateOne(args);
}

async function updatePreference(userId, employment, preference) {
  return await RecommendEmployment.updateOne(
    { author: userId, employment: employment },
    { $set: { preference: preference } }
  );
}

async function findPopulate({ ...args } = {}) {
  return await RecommendEmployment.find(args).populate({
    path: "employment",
    populate: { path: "empresa" },
  });
}

async function createMany(employments) {
  return await RecommendEmployment.insertMany(employments);
}
