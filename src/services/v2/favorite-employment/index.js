import FavoriteEmployement from "../../../models/EmpleoFavorito";

function FavoriteEmploymentService() {
  return Object.freeze({
    find,
    findPopulate,
  });
}

export default FavoriteEmploymentService();

async function find({ ...args } = {}) {
  return await FavoriteEmployement.find(args);
}

async function findPopulate({ ...args } = {}) {
  return await FavoriteEmployement.find(args).populate({
    path: "empleo",
    populate: { path: "empresa" },
  });
}
