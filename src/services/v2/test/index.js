import Test from "../../../models/Test";

function TestService() {
  return Object.freeze({
    find,
    create,
  });
}
export default TestService();

async function create(data) {
  return await Test.create(data);
}

async function find({ ...args } = {}) {
  let tests = null;
  tests = await Test.find(args);
  return tests;
}
