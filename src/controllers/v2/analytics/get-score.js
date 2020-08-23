import AnalyticsService from "../../../services/v2/analytics";
import KeywordService from "../../../services/v2/keywords/keywords-service";

const getScore = async (req, res, next) => {
  try {
    // obtener el texto
    let { jobDescription = null } = req.body;
    if (!jobDescription) {
      next(new Error("Please a need job description!"));
    }
    // obtener los keywords de todos los diccionarios de la forma {}
    const dictionariesArray = await KeywordService.getAll(null, {
      keywordsPlain: true,
    });
    // format dictionaries
    const dictionariesFormatted = dictionariesArray.map((d) => ({
      _id: d._id,
      keywords: d.keywords[0][0],
    }));
    // hacer la peticion a servidor python
    const { ok = false, result = null } = await AnalyticsService.requestScore(
      jobDescription,
      dictionariesFormatted
    );
    // obtener el puntaje
    if (!ok || !result) {
      next(new Error("Fail to obtain score"));
    }
    const dictionariesScores = result;
    // hacerr decisiones
    // enviar respuesta de exito
    return res.json({ data: dictionariesScores });
  } catch (error) {
    next(error);
  }
};

export default getScore;
