import getScore from "./get-score";
import getCvScore from "./get-cv-score";
import getAverageScore from "./get-average-score";

function AnalyticsController() {
  return Object.freeze({
    getCvScore,
    getScore,
    getAverageScore,
  });
}
export default AnalyticsController();
