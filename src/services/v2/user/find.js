import User from "../../../models/User";

const find = async ({ ...args } = {}) => {
  let allUsers = null;
  allUsers = await User.find(args);
  return allUsers;
};

export default find;
