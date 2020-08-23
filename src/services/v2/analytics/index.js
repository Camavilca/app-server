import config from "../../../config";
import axios from "axios";

const getScoreUrl = `${config.analytics.baseUrl}/selection/cvs/score`;
const getBestDictionaryUrl = `${config.analytics.baseUrl}/selection/employments/best-dictionary`;
const getCvsScoreByDictionaryUrl = `${config.analytics.baseUrl}/selection/employments/match-cvs`;
const getMatchAll = `${config.analytics.baseUrl}/selection/match/all`;
const getAverageScoreUrl = `${config.analytics.baseUrl}/selection/math/average`;

function AnalyticsService() {
  return Object.freeze({
    getCvScore,
    getBestDictionary,
    getCvsScoreByDictionaryId,
    getUpdatedAllScores,
    getAverageScore,
  });
}
export default AnalyticsService();

async function getUpdatedAllScores() {
  const response = await axios.post(getMatchAll);
  const { ok, result, message } = response.data;
  if (ok) {
    return result;
  } else {
    console.log("Ocurrio un error en Analytics server");
    throw message || new Error("Ocurrió un error");
  }
}

async function getCvScore(cvId) {
  const requestBody = {
    cvId,
  };
  const response = await axios.post(getScoreUrl, requestBody);
  const { ok = false, result = null, message = "" } = response.data;
  if (ok) {
    return result;
  } else {
    console.log("Ocurrio un error en Analytics server");
    throw message || new Error("Ocurrio un error");
  }
}

async function getBestDictionary(description) {
  console.log("getBestDictionaryUrl", getBestDictionaryUrl);
  const response = await axios.post(getBestDictionaryUrl, { description });
  console.log("reponse.data", response.data);
  const { ok = false, result = null } = response.data;
  if (ok) {
    return result;
  } else {
    console.log("Ocurrio un error en Analytics server");
    throw new Error("Ocurrio un error");
  }
}

async function getCvsScoreByDictionaryId(dictionaryId) {
  const response = await axios.post(getCvsScoreByDictionaryUrl, {
    dictionaryId,
  });
  const { ok = false, result = null } = response.data;
  if (ok) {
    return result;
  } else {
    console.log("Ocurrio un error en Analytics server");
    throw new Error("Ocurrio un error");
  }
}

async function getAverageScore({
  matchCv = null,
  matchTests = {}, // {"PERSONALIDAD": 0.76, "COMUNICACION_EFECTIVA: 0.87"}
  interviewScore = null, //0.30 === 1.5 ⭐️
  referenceScore = null, //0.30 === 1.5 ⭐️
}) {
  if (
    matchCv == null ||
    Object.entries(matchTests).length === 0 ||
    interviewScore == null ||
    referenceScore == null
  ) {
    throw new Error("Please enter all necessary inputs!");
  }
  const response = await axios.post(getAverageScoreUrl, {
    matchCv,
    matchTests,
    interviewScore,
    referenceScore,
  });
  const { ok = false, result = null } = response.data;
  if (ok) {
    return result;
  } else {
    throw new Error("Ocurrió un error en el servidor de Python");
  }
}
