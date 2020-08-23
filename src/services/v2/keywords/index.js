import Keyword from "./../../../models/Keyword";

function KeywordService() {
  return Object.freeze({
    find,
  });
}
export default KeywordService();

async function find({ ...args } = {}) {
  return await Keyword.find(args);
}
