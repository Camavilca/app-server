import runScript from "./run-script";

async function extractTextCV(cvPath) {
  try {
    const universityNamesPath = `${global.__basedir}/files/R/extractionTextFromCV/university_name.xlsx`;
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
    console.log("result from extract text cv function:", result);
    return result && result.length > 0 ? result[0] : null; //TODO: mejorar esto @VF @Renzo
  } catch (error) {
    let re = /(?<=\+z\+)(.*)(?=\+z\+)/g;
    let stopError = re.exec(error);
    if (stopError && stopError.length > 0) error = stopError[0];
    throw error;
  }
}

export default extractTextCV;
