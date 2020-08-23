import AnalyticsService from "../../../services/v2/analytics";

const getAverageScore = async (req, res, next) => {
  try {
    let result = await AnalyticsService.getAverageScore(req.body);
    return res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export default getAverageScore;
