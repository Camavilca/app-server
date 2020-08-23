import UserSelectionInfo from "../../../models/UserSelectionInfo";

export async function find({ ...args } = {}) {
  let allUsersInfo = null;
  allUsersInfo = await UserSelectionInfo.find(args);
  return allUsersInfo;
}
export async function findOne({ ...args } = {}) {
  return await UserSelectionInfo.findOne(args);
}

export async function findPopulate({ ...args } = {}) {
  let allUsersInfo = null;
  allUsersInfo = await UserSelectionInfo.find(args)
    .populate({ path: "author" })
    .populate({ path: "empresas" })
    .populate({ path: "estudios" });
  return allUsersInfo;
}

// export default find;
