import fs from "fs-extra";
const getUserFolderPath = async (userId) => {
  const userPath = `${__basedir}/files/users/${userId}`;
  await fs.ensureDir(userPath);
  return userPath;
};

export default getUserFolderPath;
