import DocxMerger from "docx-merger";
import createReport from "docx-templates";
import fs from "fs-extra";
import UserInfoService from "./../../../services/v2/user-info";
import UserService from "./../../../services/v2/user";
import plotlyServer from "plotly";
import config from "../../../config";
import libre from "libreoffice-convert";
import allNameWhitTypeTests from "./tests";
import moment from "moment";
import logger from "../../../log4";
import { testsDetails } from "../../../../config-db.json";
import {
  DonatelloInt,
  LiderazgoInt,
} from "../../../constant/selection/postulante/test/interpretaciones";
import { getFullName, getAge } from "../../../util/helpers";
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
import FormacionAcademica from "../../../models/FormacionAcademica";

const getDataGraph = (xValue, yValue) => {
  const xVal1 = xValue;
  const xVal2 = xVal1.map((item) => 100 - item);
  const yVal = yValue;

  var layout1 = {
    y: yVal,
    x: xVal1,
    type: "bar",
    orientation: "h",
    // text: xVal1.map(String),
    text: xVal1.map((item) => item + "%"),
    textposition: "auto",
    textfont: {
      color: "#FFF", // color percentage
    },
    hoverinfo: "none",
    marker: {
      color: "#FE6C00",
      line: {
        width: 1.5,
      },
    },
  };

  var layout2 = {
    y: yVal,
    x: xVal2,
    type: "bar",
    orientation: "h",
    marker: {
      color: "#FEE4CC",
      line: {
        width: 1.5,
      },
    },
  };

  var data = [layout1, layout2];

  var layout = {
    showlegend: false,
    barmode: "stack",
    bargap: 0.5,
    autosize: false,
    xaxis: {
      tickfont: {
        size: 25, //fontSizeX
        color: "black",
      },
    },
    yaxis: {
      tickfont: {
        tickfont: "Comfortaa",
        size: 25, //fontSizeY
        color: "blue",
      },
      tickprefix: "     ",
      ticksuffix: "     ",
    },
    font: {
      size: 25, //fontSizePercentage
      color: "white",
    },
    margin: {
      l: 400,
      r: 40,
      t: 30,
      b: 60,
      pad: 0,
    },
  };

  return { data, layout };
};

export function getStatisticBarGraph({ test, author }) {
  const plotly = plotlyServer({
    username: config.plotly.user,
    apiKey: config.plotly.key,
    host: "chart-studio.plotly.com",
  });

  const reversedDetails = test.detalle.reverse();
  const xVal1 = reversedDetails.map((item) => Math.ceil(item.porcentaje));
  let yVal = reversedDetails.map((item) => item.tipo);

  //se quitan las tildes de Habilidades Sociales.

  if (test.tipo === "HABILIDADES_SOCIALES") {
    yVal.map((item, index) => {
      switch (item) {
        case "Planificación":
          yVal[index] = "Planificacion".toUpperCase();
          break;
        case "Estrés":
          yVal[index] = "Estres".toUpperCase();
          break;
        case "Agresión":
          yVal[index] = "Agresion".toUpperCase();
          break;
        default:
          yVal[index] = yVal[index].toUpperCase();
          break;
      }
    });
  }

  yVal = yVal.map((item) => item.toUpperCase());
  // console.log("getStatisticBarGraph -> yVal", test.tipo, yVal);

  var graphData = getDataGraph(xVal1, yVal);

  var imgOptions = {
    format: "jpeg",
    width: 1500,
    height: 600,
  };

  let directory = `${__basedir}/files/users/${author}/images/${test.tipo}.jpeg`;
  plotly.getImage(graphData, imgOptions, async (err, imageStream) => {
    if (err) return null;
    const fileStream = fs.createWriteStream(directory);
    await imageStream.pipe(fileStream);
  });

  return directory;
}

export async function createReportCover({ author, tests, employment }) {
  let usuario = await UserService.findOne({ _id: author });
  let userInfo = await UserInfoService.findOneUserSelectionInfo({ author });
  let score = calculateScoreByTests({
    tests: tests,
    testLength: employment.pruebas.length,
  });

  const foto = {
    width: 5,
    height: 5,
    path: `${__basedir}/files/users/${author}/images/profile.png`,
  };

  if (!fs.pathExistsSync(foto.path))
    foto.path = `${__basedir}/files/profile/sinperfil.jpg`;

  let candidate = {
    photo: foto,
    fullName: getFullName(userInfo),
    age: getAge(userInfo.fecha_nacimiento),
    telephone: userInfo.telefono,
    email: usuario.email,
    documentNumber: userInfo.numero_documento,
    today: moment().format("L"),
  };

  let formacionAcademicaLista = await FormacionAcademica.find({
    author: author,
  });

  let formacionAcademica = "";
  if (formacionAcademicaLista.length === 1)
    formacionAcademica = formacionAcademicaLista[0].cicloCursando;
  else {
    formacionAcademicaLista = formacionAcademicaLista.filter(
      (item) => item.fechaFin === null
    );
    if (formacionAcademicaLista.length === 1)
      formacionAcademica = formacionAcademicaLista[0].cicloCursando;
    else
      formacionAcademica = formacionAcademicaLista.sort((a, b) =>
        a.fechaInicio.getTime() < b.fechaInicio.getTime() ? 1 : -1
      )[0].cicloCursando;
  }

  let inputPath = `${__basedir}/files/report-test/CARATULA.docx`;
  let outputPath = `${__basedir}/files/users/${author}/report-test/CARATULA.docx`;

  let reportObj = {
    template: inputPath,
    output: outputPath,
    data: {
      candidate,
      score: Math.round(score),
      jobName: employment.nombrePuesto,
      career: formacionAcademica,
    },
  };

  await createFileReport({ reportObj });
  return outputPath;
}

export async function createReportDonatello({ test, author }) {
  let pathImage = getStatisticBarGraph({
    test,
    author,
  });
  if (pathImage === null) return false;
  let donatello = test;
  let donatelloPattern = donatello.nivel.trim().toLowerCase();
  let donatelloFactor = getFactor(donatello.detalle);

  let donatelloPatternCharacteristics =
    DonatelloInt.pattern[donatelloPattern].characteristics;
  let donatelloPatternInterpretation =
    DonatelloInt.pattern[donatelloPattern].interpretation;

  let donatelloFactorCharacteristics =
    DonatelloInt.factor[donatelloFactor].characteristics;
  let donatelloFactorInterpretation =
    DonatelloInt.factor[donatelloFactor].interpretation;

  /** ordenamos las personalidades por orden del porcentaje para obtener
   *  aquella que es dominante.
   */

  let characteristics = test.detalle.sort((a, b) =>
    a.porcentaje < b.porcentaje ? 1 : -1
  );

  let inputPath = `${__basedir}/files/report-test/DONATELLO.docx`;
  let outputPath = `${__basedir}/files/users/${author}/report-test/DONATELLO.docx`;
  let reportObj = {
    template: inputPath,
    output: outputPath,
    data: {
      mainCharacteristic: characteristics[0].tipo,
      patternCharacteristics: donatelloPatternCharacteristics,
      patternInterpretation: donatelloPatternInterpretation,
      factorCharacteristics: donatelloFactorCharacteristics,
      factorInterpretation: donatelloFactorInterpretation,
      donatelloPattern: donatelloPattern.toUpperCase(),
      donatelloFactor,
      image: {
        width: 15,
        height: 10,
        path: pathImage,
      },
    },
  };

  await createFileReport({ reportObj });
  return outputPath;
}

export async function createReportLiderazgo({ test, author }) {
  let LiderazgoObj = LiderazgoInt[test.nivel.toUpperCase()];

  let total = test.detalle
    .map((item) => item.porcentaje)
    .reduce((a, b) => a + b);
  test.detalle = test.detalle.map((item) => {
    item.porcentaje = Math.ceil((item.porcentaje * 100) / total);
    return item;
  });

  let pathImage = getStatisticBarGraph({ test, author });
  if (pathImage === null) return false;
  let inputPath = `${__basedir}/files/report-test/LIDERAZGO.docx`;
  let outputPath = `${__basedir}/files/users/${author}/report-test/LIDERAZGO.docx`;
  let reportObj = {
    template: inputPath,
    output: outputPath,
    data: {
      ...LiderazgoObj,
      description: test.interpretacion,
      image: {
        width: 15,
        height: 10,
        path: pathImage,
      },
    },
  };
  await createFileReport({ reportObj });
  return outputPath;
}

export async function createReportSocial({ test, author }) {
  let details = test.detalle;
  let pathImage = getStatisticBarGraph({ test, author });
  if (pathImage === null) return false;

  let inputPath = `${__basedir}/files/report-test/SOCIAL.docx`;
  let outputPath = `${__basedir}/files/users/${author}/report-test/SOCIAL.docx`;

  let pathImgAux = `${__basedir}/files/users/${author}/images/TEST.jpeg`;

  let reportObj = {
    template: inputPath,
    output: outputPath,
    data: {
      planificacion: details[0].interpretacion,
      estres: details[1].interpretacion,
      agresion: details[2].interpretacion,
      sentimientos: details[3].interpretacion,
      image: {
        width: 15,
        height: 10,
        path: pathImage,
        // path: pathImgAux,
      },
    },
  };

  await createFileReport({ reportObj });
  return outputPath;
}

export async function createReportMoss({ test, author }) {
  let details = test.detalle;
  let pathImage = getStatisticBarGraph({ test, author });
  if (pathImage === null) return false;
  let inputPath = `${__basedir}/files/report-test/MOSS.docx`;
  let outputPath = `${__basedir}/files/users/${author}/report-test/MOSS.docx`;
  let reportObj = {
    template: inputPath,
    output: outputPath,
    data: {
      supervision: details[0].interpretacion,
      relacionesHumanas: details[1].interpretacion,
      problemasInterpersonales: details[2].interpretacion,
      establecimientoRelaciones: details[3].interpretacion,
      sentidoComun: details[4].interpretacion,
      image: {
        width: 15,
        height: 10,
        path: pathImage,
      },
    },
  };

  await createFileReport({ reportObj });
  return outputPath;
}

export async function createReportHalfAPage({ tests, author }) {
  let allTest = [];

  for (const key in tests) {
    if (tests.hasOwnProperty(key)) {
      const test = tests[key];
      let testInfo = allNameWhitTypeTests.find(
        (item) => item.type === test.tipo
      );

      let pathImage = getImageStatisticPieChart({ score: test.porcentaje });
      let subtitle = test.nivel ? test.nivel : "";
      if (test.interpretacion === "")
        test.interpretacion =
          testsDetails[test.tipo].interpretation[
            test.nivel
          ].interpretacionCorta;

      allTest.push({
        index: parseInt(key),
        score: test.porcentaje,
        title: testInfo.title,
        description: test.interpretacion,
        image: {
          width: 5,
          height: 5,
          path: pathImage,
        },
        subtitle: subtitle,
      });
    }
  }

  // console.log("allTest: ", allTest);

  let inputPath = `${__basedir}/files/report-test/TEST.docx`;
  let outputPath = `${__basedir}/files/users/${author}/report-test/TEST.docx`;
  let reportObj = {
    template: inputPath,
    output: outputPath,
    data: { tests: allTest },
  };

  await createFileReport({ reportObj });
  return outputPath;
}

export async function createFileReport({ reportObj }) {
  await createReport(reportObj);
}

export async function mergeFiles({ files = [], pathToSave = "" }) {
  let filesBinary = files.map((file) => fs.readFileSync(file, "binary"));
  var docx = new DocxMerger({}, filesBinary);
  docx.save("nodebuffer", (data) => {
    fs.writeFile(pathToSave, data, function () {});
  });
}

export async function convertToPdf({ inputPath, outputPath }) {
  return new Promise((resolve, reject) => {
    var file = fs.readFileSync(inputPath);
    // console.log("TAM Bytes", file.byteLength);
    libre.convert(file, ".pdf", undefined, (err, done) => {
      if (err) {
        // console.log("err", err);
        reject(`Error converting file: ${err}`);
      }
      // console.log("done", done);
      fs.writeFileSync(outputPath, done);
      // console.log("escribio pdf");
      resolve("Nice!");
    });
  });
}

function calculateScoreByTests({ tests, testLength }) {
  let score = 0;
  tests.map((test) => {
    switch (test.tipo) {
      case NAME_DONATELLO:
        let porcentagesDonatello = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        score += Math.max(...porcentagesDonatello);
        break;
      case NAME_DARTAGNAN:
        score += test.porcentaje;
        break;
      case NAME_SOCIAL:
        let porcentagesSocial = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        var calculatePercentage = porcentagesSocial.reduce((a, b) => a + b, 0);
        calculatePercentage = calculatePercentage / test.detalle.length;
        score += calculatePercentage;
        break;
      case NAME_LIDERAZGOGOLEN:
        let porcentagesLiderazgo = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        score += Math.max(...porcentagesLiderazgo);
        break;
      case NAME_MOSS:
        score += 1;
        let porcentagesMoss = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        var calculatePercentage = porcentagesMoss.reduce((a, b) => a + b, 0);
        calculatePercentage = calculatePercentage / test.detalle.length;
        score += calculatePercentage;
        break;
      case NAME_INTELIGENCIA:
        score += test.porcentaje;
        break;
      case NAME_BAP7:
        score += test.porcentaje;
        break;
      case NAME_BAP6:
        score += test.porcentaje;
        break;
      case NAME_CAMBIOS:
        score += test.porcentaje;
        break;
      case NAME_D48VR:
        score += test.porcentaje;
        break;
      case NAME_EMPRENDIMIENTO:
        score += test.porcentaje;
        break;
      case NAME_ASERTIVIDAD:
        score += test.porcentaje;
        break;
      case NAME_APTITUD_VERBAL:
        score += test.porcentaje;
        break;
    }
  });

  let calculateScore = score / testLength;
  if (isNaN(calculateScore)) {
    return 0;
  } else {
    return calculateScore;
  }
}

function getImageStatisticPieChart({ score }) {
  let roundScore = Math.round(score);
  let imagePath = `${__basedir}/files/report-test/image/${roundScore}.jpg`;
  return imagePath;
}

function getFactor(array) {
  if (array && array.length > 0) {
    const maxValue = Math.max.apply(
      Math,
      array.map((o) => o.porcentaje)
    );
    const obj = array.find((o) => o.porcentaje === maxValue);
    return obj.tipo.trim().toLowerCase();
  }
  return null;
}
