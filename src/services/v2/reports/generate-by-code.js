import PathService from "../path";
import TestService from "../test";
import UserInfoService from "../user-info";
import UserService from "../user";
import createReport from "docx-templates";
import PlotlyService from "../plotly";
import ConvertService from "../convert";
import getDataByTest from "./get-data-by-test";
import fs from "fs-extra";

import {
  COMPLETE_REPORT,
  FREE_REPORT,
  PROFESIONAL_PROFILE_REPORT,
  INTELLIGENSE_REPORT,
} from "../../../constant/selection/postulante/reports/names";

import {
  NAME_DONATELLO,
  NAME_DARTAGNAN,
  NAME_SOCIAL,
  NAME_LIDERAZGOGOLEN,
  NAME_MOSS,
  NAME_INTELIGENCIA,
  NAME_BAP7,
  NAME_BAP6,
  NAME_CAMBIOS,
  NAME_D48VR,
  NAME_EMPRENDIMIENTO,
  NAME_ASERTIVIDAD,
  NAME_APTITUD_VERBAL,
} from "../../../constant/selection/postulante/test/names";

async function generateReportByCode(code, userId, { toPdf = false } = {}) {
  const [user = null] = await UserService.find({ _id: userId });
  const [userInfo = null] = await UserInfoService.findUserSelectionInfo({
    author: userId,
  });
  if (!userInfo) {
    throw new Error("Complete su perfil por favor.");
  }
  const outputFilename = getFilenameByCode(code);
  const templateName = getTemplateFilenameByReport(code);
  const outputReportsPath = `${await PathService.getUserReportsPath(
    userId
  )}/${outputFilename}`;

  const reportTemplatePath = await PathService.getReportsFilePath(
    code,
    templateName
  );

  const requiredTestsForReportArray = getRequiredTestsByReport(code);
  const userTestsDone = await TestService.find({ author: userId });
  if (!userTestsDone || userTestsDone.length === 0) {
    throw new Error("Realize las pruebas requeridas por favor.");
  }
  const userTestsDoneCodes = userTestsDone.map((test) => test.tipo);

  requiredTestsForReportArray.forEach((testCode) => {
    if (!userTestsDoneCodes.includes(testCode)) {
      throw new Error(
        `Es necesario realizar la prueba ${getTestNameByCode(testCode)}`
      );
    }
  });

  let data = {};
  data["PROFILE"] = { ...userInfo.toObject(), ...user.toObject() };
  for await (let testCode of requiredTestsForReportArray) {
    const dataByTest = await getDataByTest(userId, testCode);
    data[testCode] = dataByTest;
  }

  console.log(data);

  let imageUserPath = await PathService.getUserImagesFolderPath(userId);
  let additionalJsContext = {};
  additionalJsContext = await executeImageTasksByReport(
    code,
    data,
    imageUserPath
  );
  try {
    await createReport({
      template: reportTemplatePath,
      output: outputReportsPath,
      data: data,
      literalXmlDelimiter: "||",
      processLineBreaks: true,
      additionalJsContext,
      failFast: false,
    });
  } catch (errors) {
    console.log(errors);
  }

  if (!toPdf) {
    return outputReportsPath;
  }

  let outputPdfPath = outputReportsPath.split(".")[0] + ".pdf";
  await ConvertService.toExpecificExtend(outputReportsPath, outputPdfPath);
  return outputPdfPath;
}

export default generateReportByCode;

async function executeImageTasksByReport(code, data, path) {
  switch (code) {
    case FREE_REPORT:
      break;
    case COMPLETE_REPORT:
      break;
    case PROFESIONAL_PROFILE_REPORT:
      break;
    case INTELLIGENSE_REPORT: {
      let dartagnanPercent = data[NAME_DARTAGNAN].test.porcentaje;
      let aptitudVerbalPercent =
        data[NAME_APTITUD_VERBAL].test.porcentaje * 100;
      let cambiosPercent = data[NAME_CAMBIOS].test.porcentaje;
      let bap7Percent = data[NAME_BAP7].test.porcentaje;
      let bap6Percent = data[NAME_BAP6].test.porcentaje;

      const dataGraph = {
        data: [
          {
            type: "scatterpolar",
            r: [
              dartagnanPercent,
              aptitudVerbalPercent,
              cambiosPercent,
              bap7Percent,
              bap6Percent,
            ],
            theta: [
              "Inteligencia",
              "Aptitud Verbal",
              "Flexibilidad Cognitiva",
              "Razonamiento Logico",
              "Aptitud Numerica",
            ],
            fill: "toself",
          },
        ],
        layout: {
          polar: {
            radialaxis: {
              visible: true,
              range: [0, 100],
            },
          },
        },
      };
      const spiderImagePath = `${path}/spider.png`;
      await PlotlyService.generateSpiderMap(dataGraph, spiderImagePath);

      return {
        injectRadarImage: () => {
          return {
            width: 16,
            height: 9,
            data: fs.readFile(spiderImagePath),
            extension: ".png",
          };
        },
      };
    }
    default:
      return null;
  }
}
function getTemplateFilenameByReport(code) {
  switch (code) {
    case FREE_REPORT:
      return "informe_gratuito_ver2.docx";
    case COMPLETE_REPORT:
      return "informe_completo_ver1.docx";
    case PROFESIONAL_PROFILE_REPORT:
      return "informe_perfil_profesional_v2_mas.docx";
    case INTELLIGENSE_REPORT:
      return "informe_inteligencia.docx";
    default:
      return null;
  }
}

function getRequiredTestsByReport(code) {
  switch (code) {
    case FREE_REPORT:
      return [NAME_DONATELLO, NAME_BAP7, NAME_ASERTIVIDAD];
    case COMPLETE_REPORT:
      return [NAME_DONATELLO, NAME_BAP7, NAME_ASERTIVIDAD];
    case PROFESIONAL_PROFILE_REPORT:
      return [
        NAME_DONATELLO,
        NAME_BAP7,
        NAME_ASERTIVIDAD,
        NAME_DARTAGNAN,
        NAME_SOCIAL,
        NAME_LIDERAZGOGOLEN,
      ];
    case INTELLIGENSE_REPORT:
      return [
        NAME_APTITUD_VERBAL,
        NAME_DARTAGNAN,
        NAME_CAMBIOS,
        NAME_BAP7,
        NAME_BAP6,
      ];

    default:
      return null;
  }
}

function getFilenameByCode(code) {
  switch (code) {
    case FREE_REPORT:
      return "free_report.docx";
    case COMPLETE_REPORT:
      return "free_report.docx";
    case PROFESIONAL_PROFILE_REPORT:
      return "free_report.docx";
    case INTELLIGENSE_REPORT:
      return "intellegense_report.docx";
    default:
      return null;
  }
}

function getTestNameByCode(code) {
  switch (code) {
    case NAME_APTITUD_VERBAL:
      return "Aptitud Verbal";
    case NAME_DARTAGNAN:
      return "Inteligencia";
    case NAME_CAMBIOS:
      return "Adaptabilidad";
    case NAME_BAP7:
      return "Razonamiento Lógico";
    case NAME_BAP6:
      return "Aptitud Numérica";
    default:
      return null;
  }
}
