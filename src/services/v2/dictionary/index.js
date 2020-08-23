import mongoose from "mongoose";
import Dictionary from "../../../models/Keyword";
function DictionaryService() {
  return Object.freeze({
    upsert,
    duplicate,
  });
}
export default DictionaryService();

async function upsert(data) {
  const {
    dictionaryId = null,
    keywords = null,
    name = null,
    area = null,
    country = null,
    province = null,
    type = null,
  } = data;
  if (!keywords || !name || !country || !province || !area) {
    throw new Error(
      "Keywords, name, country, area and province fields are neccesary!"
    );
  }
  //NUEVA ACTUALIZACION
  var query = { _id: dictionaryId };
  if (!query._id) query._id = new mongoose.mongo.ObjectID();

  const newDictionary = await Dictionary.findOneAndUpdate(
    query,
    {
      keywords,
      puesto: name.trim(),
      country,
      area,
      province,
      type,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return newDictionary;
}

async function duplicate(dictionaryId) {
  let dictionary = await Dictionary.findById(dictionaryId);
  dictionary._id = mongoose.Types.ObjectId();
  dictionary.isNew = true;
  dictionary.save();
  return dictionary;
}
