import ReportService from "./../../../services/v2/reports";
import TestService from "./../../../services/v2/test";
import EmploymentService from "./../../../services/v2/employment";
import {
  createReportCover,
  mergeFiles,
  createReportDonatello,
  convertToPdf,
  createReportHalfAPage,
  createReportMoss,
  createReportLiderazgo,
  createReportSocial,
} from "./report-test-by-employmet";
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
import fs from "fs-extra";
import logger from "../../../log4";
import { REALIZADO } from "../../../constant/selection/postulante/test/estados";

function ReportsController() {
  return Object.freeze({
    getReportByCode,
    createReportTestByEmployment,
  });
}
export default ReportsController();

async function getReportByCode(req, res, next) {
  try {
    const { code } = req.body;
    const { userId } = req.session.user;
    let generatedReportPath = await ReportService.generateReportByCode(
      code,
      userId,
      { toPdf: true }
    );
    return res.download(generatedReportPath);
  } catch (error) {
    next(error);
  }
}

const cleanRepetitiveTest = (lista) => {
  let uniqueList = [];
  lista.map((item) => {
    const index = uniqueList.findIndex((elem) => elem.tipo === item.tipo);
    if (index === -1) uniqueList.push(item);
    else {
      const elemUnique = uniqueList[index];
      if (item.createdAt.getTime() > elemUnique.createdAt.getTime())
        uniqueList[index] = item;
    }
  });
  return uniqueList;
};

const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds));
};

async function createReportTestByEmployment(req, res, next) {
  try {
    const { userId = null } = req.session.user;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");

    const { author, listTestComplet, idEmployment } = req.body;

    fs.ensureDirSync(__basedir + "/files/users/" + author + "/images");
    fs.ensureDirSync(__basedir + "/files/users/" + author + "/report-test");

    let listTypesTests = listTestComplet.map((item) => item.type);

    let tests = await TestService.find({
      author: author,
      tipo: { $in: listTypesTests },
      estado: REALIZADO,
    });

    let employment = await EmploymentService.findOne({ _id: idEmployment });

    let reportsPaths = [];
    // Creación de la caratula del reporte
    let caratula = await createReportCover({ author, tests, employment });
    // Agregamos el directorio de la caratula del reporte
    reportsPaths.push(caratula);

    let allTestInfo = [];

    let objSwitchTest = await switchTests({ tests, author });

    objSwitchTest.paths.length > 0 &&
      objSwitchTest.paths.map((item) => reportsPaths.push(item));

    objSwitchTest.testsInfos.length > 0 &&
      objSwitchTest.testsInfos.map((item) => allTestInfo.push(item));

    if (allTestInfo.length > 0) {
      // logger.info("====> tests", allTestInfo);
      let clearListTest = cleanRepetitiveTest(allTestInfo);
      // logger.info("====> clearTest", clearListTest);

      let pathReportHalfPage = await createReportHalfAPage({
        tests: clearListTest,
        author,
      });
      reportsPaths.push(pathReportHalfPage);
    }

    let pathToSaveDocx = `${__basedir}/files/users/${author}/report-test/Reporte-Completo.docx`;
    let pathToSavePdf = `${__basedir}/files/users/${author}/report-test/Reporte-Completo.pdf`;
    let finalPagePath = `${__basedir}/files/report-test/FINALPAGE.docx`;
    reportsPaths.push(finalPagePath);

    // console.log("reportsPaths: ", reportsPaths);

    await mergeFiles({ files: reportsPaths, pathToSave: pathToSaveDocx });
    // console.log("paths: ", pathToSaveDocx, pathToSavePdf);

    await sleep(4);

    try {
      const exists = await fs.exists(pathToSaveDocx);
      if (exists) {
        var file = fs.readFileSync(pathToSaveDocx);
        console.log(
          "createReportTestByEmployment -> exists",
          exists,
          file.byteLength
        );

        await convertToPdf({
          inputPath: pathToSaveDocx,
          outputPath: pathToSavePdf,
        });
      } else {
        return res.json({ ok: false, message: "Problema al generar el pdf" });
      }
    } catch (err) {
      console.log("createReportTestByEmployment -> err", err);
      return res.json({ ok: false, message: "Problema al generar" });
    }
    return res.json({ ok: true, data: true });
  } catch (error) {
    next(error);
  }
}

async function switchTests({ tests, author }) {
  // console.log("switchTests -> tests, author", tests, author);
  let paths = [];
  let testsInfos = [];
  for (const key in tests) {
    const test = tests[key];
    switch (test.tipo) {
      case NAME_DONATELLO:
        var directoryDocument = await createReportDonatello({ test, author });
        paths.push(directoryDocument);
        break;
      case NAME_DARTAGNAN:
        testsInfos.push(test);
        break;
      case NAME_SOCIAL:
        // console.log("social", test, author);
        //LA PRUEBA TIENE DETALLE
        var directoryDocument = await createReportSocial({ test, author });
        paths.push(directoryDocument);
        break;
      case NAME_LIDERAZGOGOLEN:
        var directoryDocument = await createReportLiderazgo({ test, author });
        paths.push(directoryDocument);
        break;
      case NAME_MOSS:
        var directoryDocument = await createReportMoss({ test, author });
        paths.push(directoryDocument);
        break;
      case NAME_INTELIGENCIA:
        testsInfos.push(test);
        break;
      case NAME_BAP7:
        testsInfos.push(test);
        break;
      case NAME_BAP6:
        testsInfos.push(test);
        break;
      case NAME_CAMBIOS:
        testsInfos.push(test);
        break;
      case NAME_D48VR:
        testsInfos.push(test);
        break;
      case NAME_EMPRENDIMIENTO:
        testsInfos.push(test);
        break;
      case NAME_ASERTIVIDAD:
        testsInfos.push(test);
        break;
      case NAME_APTITUD_VERBAL:
        testsInfos.push(test);
        break;
      default:
        break;
    }
  }
  return {
    paths,
    testsInfos,
  };
}
