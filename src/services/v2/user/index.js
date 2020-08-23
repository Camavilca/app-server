import User from "../../../models/User";

import updateById from "./update-by-id";
import find from "./find";

function UserService() {
  return Object.freeze({
    updateById,
    find,
    findOne,
  });
}
export default UserService();

async function findOne({ ...args } = {}) {
  let user = null;
  user = await User.findOne(args);
  return user;
}
