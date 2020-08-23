import { find as findUserInfo } from "./find-user-info";
import { findOne as findOneUserInfo } from "./find-user-info";
import { find as findUserSelectionInfo } from "./find-user-selection-info";
import { findOne as findOneUserSelectionInfo } from "./find-user-selection-info";
import { findPopulate as findUserSelectionInfoPopulate } from "./find-user-selection-info";

function userInfo() {
  return Object.freeze({
    findUserInfo,
    findUserSelectionInfo,
    findOneUserSelectionInfo,
    findUserSelectionInfoPopulate,
    findOneUserInfo,
  });
}

export default userInfo();
