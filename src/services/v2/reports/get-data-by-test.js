import TestService from "./../test";
import { testsDetails } from "../../../../config-db.json";

export default async function getDataByTest(userId, testCode) {
  // todo: "tipo" deberia ser "code"
  const [test = null] = await TestService.find({
    author: userId,
    tipo: testCode,
  });
  if (!test) {
    // la data simplemente no va a existir si no se ha realizado la prueba
    return {};
  }
  // todo: nivel deberia ser level
  const level = test.nivel;
  // todo: deberia haber en bd la colleccion "config"
  // en donde esten todas las interpretaciones por prueba
  const testDetails = testsDetails[testCode];
  const interpretationLevel = testDetails.interpretation[level] || {};
  return { interpretationLevel, test };
}
