import Keyword from "./../../../models/Keyword";
import convertPlainDictionary from "./plain-text-dicctionary";
function AnalyticsService() {
  async function getAll(params, options) {
    try {
      let diccionaries = [];
      diccionaries = await Keyword.find();
      if (options.keywordsPlain) {
        diccionaries = diccionaries.map((dic) => {
          let newKeywordStr = convertPlainDictionary(dic.keywords);
          // Apesar ded que newKeywordStr es un string, al asignarlo a
          // dic toma la forma del modelo [[String]]
          dic.keywords = newKeywordStr;
          return dic;
        });
      }
      return diccionaries;
    } catch (error) {
      throw error;
    }
  }
  return Object.freeze({
    getAll,
  });
}

export default AnalyticsService();
