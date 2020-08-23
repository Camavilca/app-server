import FavoriteEmploymentService from "../../../services/v2/favorite-employment";
import { getPostulatedJobs } from "../employments/clean-jobs";

function FavoriteEmploymentController() {
  return Object.freeze({
    find,
  });
}
export default FavoriteEmploymentController();

async function find(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");

    let postulateEmployments = [];
    postulateEmployments = await getPostulatedJobs(userId);

    let favoritesEmployments = await FavoriteEmploymentService.findPopulate({
      empleo: { $nin: [...postulateEmployments] },
      author: userId,
    });

    let jsonFavoriteEmployments = favoritesEmployments.map(
      (item) => item.empleo
    );
    return res.json({ ok: true, data: jsonFavoriteEmployments });
  } catch (error) {
    next(error);
  }
}
