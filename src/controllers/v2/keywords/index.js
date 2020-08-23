import KeywordService from "../../../services/v2/keywords";
import EmploymentService from "../../../services/v2/employment";

function KeywordsController() {
  return Object.freeze({
    getByCompany,
  });
}
export default KeywordsController();

async function getByCompany(req, res, next) {
  try {
    const { userId = null } = req.session.user;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");

    let employments = await EmploymentService.find({ author: userId });
    let Idskeywords = employments.map((employment) => employment.dictionary);
    let keywords = await KeywordService.find({
      _id: { $in: Idskeywords },
    });
    return res.json({ ok: true, data: keywords });
  } catch (error) {
    next(error);
  }
}
