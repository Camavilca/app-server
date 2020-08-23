import Charge from "../../../models/Cargo";

async function create({
  author = null,
  tokenId = null,
  email = null,
  testName = null,
}) {
  if (!testName || !author) {
    throw new Error("Please specify userId and testName field");
  }
  let result = await Charge.create({
    author,
    tokenId,
    email,
    testName,
  });

  return result;
}

export default create;
