import PostulationService from "../../../services/v2/postulation";
import FavoriteEmploymentService from "../../../services/v2/favorite-employment";
import RecommendEmploymentService from "../../../services/v2/recommend-employment";
import {
  DEFAULT,
  INTERESTED,
} from "../../../constant/selection/employments/recommended";

export async function getPostulatedJobs(author) {
  let postulatedJobs = [];
  let postulations = await PostulationService.find({ author });
  if (postulations)
    postulatedJobs = postulations.map((postulation) => postulation.empleo._id);
  return postulatedJobs;
}

export async function getFavoriteJobs(author) {
  let favoriteJobs = [];
  let favorites = await FavoriteEmploymentService.find({ author });
  if (favorites)
    favoriteJobs = favorites.map((favorito) => favorito.empleo._id);
  return favoriteJobs;
}

//@desc obtener todos los ids de los empleos de preferencia @DEFAULT y @INTERESTED
export async function getRecommendedJobsNoInterested(author) {
  let idRecommendJobs = [];
  let recommends = await RecommendEmploymentService.find({
    author,
    preference: {
      $in: [DEFAULT, INTERESTED],
    },
  });

  if (recommends)
    idRecommendJobs = recommends.map((recommend) => recommend.employment);
  return idRecommendJobs;
}
