import fs from "fs-extra";
import getUserFolderPath from "./get-user-path";
const getUserFilePath = async (id, filename) => {
  const userPath = getUserFolderPath();
  const filePath = `${userPath}/${filename}`;
  await fs.ensureDir(filePath);
  return filePath;
};

export default getUserFilePath;
