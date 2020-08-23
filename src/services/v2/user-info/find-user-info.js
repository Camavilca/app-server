import UserSelectionInfo from "../../../models/UserSelectionInfo";
import UserInfo from "../../../models/UserInfo";

export async function find({ ...args } = {}) {
  let allUsersSelectionInfos = null;
  allUsersSelectionInfos = await UserSelectionInfo.find(args);
  return allUsersSelectionInfos;
}

export async function findOne({ ...args } = {}) {
  let userInfo = null;
  userInfo = await UserInfo.findOne(args);
  return userInfo;
}
