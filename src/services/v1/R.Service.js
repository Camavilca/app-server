import R from "r-script";

function runScript(data, locationFile) {
  return new Promise((resolve, reject) => {
    try {
      let out = R(locationFile).data(data).callSync();
      resolve(out);
    } catch (error) {
      console.log("Inicio --Este es el error dentro de runScriptR");
      console.log(error);
      console.log("Fin -- Este es el error dentro de runScriptR");
      reject(error);
    }
  });
}

async function extractTextFromCV(cvPath) {
  const universityNamesPath = `${__basedir}/files/R/extractionTextFromCV/university_name.xlsx`;
  const stopWordsPath = `${__basedir}/files/R/extractionTextFromCV/stopwords.xlsx`;
  const goodWordsPath = `${__basedir}/files/R/extractionTextFromCV/good_words.xlsx`;
  const locationFile = `${__basedir}/R/extractionCVToText.R`;

  const result = await runScript(
    {
      universityNamesPath,
      stopWordsPath,
      goodWordsPath,
      cvPath,
    },
    locationFile
  );
  console.log("result->", result);
  return result && result.length > 0 ? result[0] : null;
}

export default {
  runScript,
  extractTextFromCV,
};
