 import ScoreService from "../../../services/v2/score";
import AnalyticsService from "../../../services/v2/analytics";
function ScoreController() {
  return Object.freeze({
    findScore,
    updateAllScores,
  });
}

export default ScoreController();

async function updateAllScores(req, res, next) {
  try {
    let result = await AnalyticsService.getUpdatedAllScores();
    for (const match of result) {
      for await (const dictionaryId of Object.keys(match.dictionaries)) {
        ScoreService.upsert({
          cvId: match.cvId,
          dictionaryId,
          score: match.dictionaries[dictionaryId],
        });
      }
    }
    res.json({ ok: true, message: "Actualizado satisfactoriamente" });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function findScore(req, res, next) {
  try {
    const cvId = req.body.cv;
    const dictionaryId = req.body.dictionary;
    let score = 0;
    score = ScoreService.findOne({ cv: cvId, keyword: dictionaryId });
    if (!score) {
      return res.json({
        ok: true,
        data: {
          score: 0,
        },
      });
    } else {
      return res.json({
        ok: true,
        data: {
          score: score.puntaje,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}
