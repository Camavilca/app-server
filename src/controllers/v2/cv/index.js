import CvService from "../../../services/v2/cv";

function CvController() {
  return Object.freeze({
    findOneCv,
  });
}
export default CvController();

async function findOneCv(req, res, next) {
  try {
    let cv = await CvService.findOne({ author: req.params.author });
    return res.json({
      ok: true,
      data: cv || null,
    });
  } catch (error) {
    next(error);
  }
}
