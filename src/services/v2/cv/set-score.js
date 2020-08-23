import ScoreService from "../score";
import AnalyticsService from "../analytics";

async function setScore(cvId) {
  const scoreCVDicctionaries = await AnalyticsService.getCvScore(cvId);

  // scoreCVDicctionaries => {"i2ny3z237283n": 123.23}
  for await (let [dictionaryId, cvScore] of Object.entries(
    scoreCVDicctionaries
  )) {
    await ScoreService.upsert({
      cvId,
      dictionaryId,
      score: cvScore,
    });
  }
}

export default setScore;
