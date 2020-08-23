import fs from "fs-extra";
import {
  FREE_REPORT,
  COMPLETE_REPORT,
  INTELLIGENSE_REPORT,
  PROFESIONAL_PROFILE_REPORT,
} from "../../../constant/selection/postulante/reports/names";

function PathService() {
  return Object.freeze({
    getUserFolderPath,
    getUserFilePath,
    getUserCvPath,
    getUserReportsPath,
    getTemplatesFolderPath,
    getReportsFilePath,
getUserImagesFolderPath
  });
}

export default PathService();

const CV_FOLDER = "cv";
const IMAGES_FOLDER = "images";

const FREE_REPORT_FOLDER = "informe_gratuito/v2";
const COMPLETE_REPORT_FOLDER = "informe_completo/v2";
const PROFESIONAL_PROFILE_REPORT_FOLDER = "informe_perfil_profesional/v2";
const INTELLIGENSE_REPORT_FOLDER = "informe_inteligencia/v2";

async function getTemplatesFolderPath() {
  const templatesPath = `${__basedir}/files/templates`;
  await fs.ensureDir(templatesPath);
  return templatesPath;
}

async function getUserFolderPath(userId) {
  const userPath = `${__basedir}/files/users/${userId}`;
  await fs.ensureDir(userPath);
  return userPath;
}

async function getUserFilePath(id, filename) {
  const userPath = await getUserFolderPath(id);
  const filePath = `${userPath}/${filename}`;
  await fs.ensureDir(filePath);
  return filePath;
}

async function getUserCvPath(userId) {
  const userPath = await getUserFolderPath(userId);
  const cvPath = `${userPath}/${CV_FOLDER}`;
  await fs.ensureDir(cvPath);
  return cvPath;
}

async function getUserImagesFolderPath(userId) {
  const userPath = await getUserFolderPath(userId);
  const imagesPath = `${userPath}/${IMAGES_FOLDER}`;
  await fs.ensureDir(imagesPath);
  return imagesPath;
}

async function getUserReportsPath(userId) {
  const REPORTS_FOLDER_NAME = "myReports";
  const userPath = await getUserFolderPath(userId);
  const reportsPath = `${userPath}/${REPORTS_FOLDER_NAME}`;
  await fs.ensureDir(reportsPath);
  return reportsPath;
}

async function getReportsFilePath(code, filename) {
  let templateFilePath = null;
  const templateFolderPath = await getTemplatesFolderPath();

  let folderName = null;

  switch (code) {
    case FREE_REPORT:
      folderName = FREE_REPORT_FOLDER;
      break;
    case COMPLETE_REPORT:
      folderName = COMPLETE_REPORT_FOLDER;
      break;
    case PROFESIONAL_PROFILE_REPORT:
      folderName = PROFESIONAL_PROFILE_REPORT_FOLDER;
      break;
    case INTELLIGENSE_REPORT:
      folderName = INTELLIGENSE_REPORT_FOLDER;
      break;
    default:
      throw new Error("Incorrect report code 🙅‍♂️.");
  }

  templateFilePath = `${templateFolderPath}/${folderName}/${filename}`;
  return templateFilePath;
}
