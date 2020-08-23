import User from "../../../models/User";

const updateById = async (id = null, data = null) => {
  if (!id || !data) {
    throw new Error("id, data params required");
  }
  let updatedUser = null;
  updatedUser = await User.findByIdAndUpdate({ _id: id }, data);
  return updatedUser;
};

export default updateById;
