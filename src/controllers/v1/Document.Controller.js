import createReport from "docx-templates";
import fs from "fs-extra";
import Test from "../../models/Test";
import UserSelectionInfo from "../../models/UserSelectionInfo";
import User from "../../models/User";
import {
  NAME_DONATELLO, // Personalidad
  NAME_ASERTIVIDAD, // Asertividad
  NAME_BAP7, // Razonamiento
  NAME_DARTAGNAN,
  NAME_SOCIAL,
  NAME_LIDERAZGOGOLEN, // Inteligencia
} from "../../constant/selection/postulante/test/names";
import { getAge } from "../../util/helpers";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import libre from "libreoffice-convert";
// import PlotlyService from "../../services/v1/Plotly.Service";

import {
  AsertividadInt,
  DonatelloInt,
  Bap7Int,
  DartagnanInt,
  LiderazgoInt,
} from "../../constant/selection/postulante/test/interpretaciones";

const toCapitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
async function createFreeReport(req, res) {
  try {
    // Tenemos que obtener esta variable por session: Razones de seguridad
    const { userId } = req.params;
    const userFiles = `${global.__basedir}/files/users/${userId}/documents/myReports`;
    const template = `${global.__basedir}/files/templates/informe_gratuito/v2/informe_gratuito_ver2.docx`;
    const output = `${userFiles}/free_report.docx`;
    const outputPdf = `${userFiles}/free_report.pdf`;

    const templateExists = await fs.exists(template);
    fs.ensureDirSync(userFiles);

    if (!templateExists) {
      console.log("Error: Free report basic");
      return res.json({
        ok: false,
        message: "Ocurrió un error al crear el archivo",
      });
    }

    // obtener informacion de modelos
    const tests = await Test.find({ author: userId });

    // verificamos si no existen test
    if (!tests.length) {
      return res.json({
        ok: false,
        message: "Tiene que realizar almenos una prueba!",
      });
    }

    let donatello = tests.find((t) => t.tipo === NAME_DONATELLO);
    let bap7 = tests.find((t) => t.tipo === NAME_BAP7);
    let asertividad = tests.find((t) => t.tipo === NAME_ASERTIVIDAD);

    if (!donatello) {
      return res.json({
        ok: false,
        message: "Por favor, completa la prueba de Personalidad.",
      });
    }
    if (!bap7) {
      return res.json({
        ok: false,
        message: "Por favor, completa la prueba de Razonamiento Lógico.",
      });
    }
    if (!asertividad) {
      return res.json({
        ok: false,
        message: "Por favor, completa la prueba de Comunicación Efectiva.",
      });
    }

    const user = await User.findOne({ _id: userId });
    const userInfo = await UserSelectionInfo.findOne({ author: userId });

    if (!userInfo) {
      return res.json({ ok: false, message: "Por favor, complete su perfil." });
    }

    const donatelloPattern = donatello.nivel.trim().toLowerCase();
    const donatelloInterpretation =
      DonatelloInt.pattern[donatelloPattern].interpretation;
    const razonamientoInterpretation = Bap7Int[bap7.nivel];
    const asertividadInterpretation = AsertividadInt[asertividad.nivel];

    await createReport({
      template,
      output,
      data: {
        report: {
          actualDate: format(new Date(), "dd 'de' MMMM yyyy", { locale: es }),
          fullname: `${userInfo.nombre || ""} ${userInfo.paterno || ""} ${
            userInfo.materno || ""
          }`,
          age: getAge(userInfo.fecha_nacimiento),
          code: `${userInfo.dni || ""}`,
          phone: `${userInfo.telefono || ""}`,
          email: `${user.email || ""}`,

          donatelloPattern: `${toCapitalize(donatelloPattern)}`,
          donatelloResume: donatelloInterpretation.resumen || "",
          donatelloParagraphOne: donatelloInterpretation.parrafoUno || "",
          donatelloParagraphTwo: donatelloInterpretation.parrafoDos || "",

          razonamientoInterpretacionCorta:
            razonamientoInterpretation.interpretacionCorta,
          asertividadInterpretacionCorta:
            asertividadInterpretation.interpretacionCorta || "",
        },
      },
      literalXmlDelimiter: "||",
    });

    const enterPath = output;
    const outputPath = outputPdf;
    const file = fs.readFileSync(enterPath);
    const exists = await fs.exists(output);

    if (exists) {
      await convertToPdf(file, outputPath);
      return res.download(outputPdf);
    } else {
      return res.json({
        ok: false,
        message: "Hubo un problema al generar el archivo.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      ok: false,
      message: "Hubo un problema al generar el archivo.",
    });
  }
}
const convertToPdf = (file, outputPath) => {
  return new Promise((resolve, reject) => {
    libre.convert(file, ".pdf", undefined, (err, done) => {
      if (err) {
        reject(`Error converting file: ${err}`);
      }
      fs.writeFileSync(outputPath, done);
      resolve("Nice!");
    });
  });
};
// async function existFile(route, res) {
//   const exist = await fs.exists(route);
//   const message = "Ocurrio un error al generar las images";
//   if (!exist) return res.json({ ok: false, message: message });
// }
const getFactor = (array) => {
  if (array && array.length > 0) {
    const maxValue = Math.max.apply(
      Math,
      array.map((o) => o.porcentaje)
    );
    const obj = array.find((o) => o.porcentaje === maxValue);
    return obj.tipo.trim().toLowerCase();
  }
  return null;
};

async function createCompleteReport(req, res) {
  // Tenemos que obtener esta variable por session: Razones de seguridad
  const { userId } = req.params;
  const userFiles = `${global.__basedir}/files/users/${userId}/documents/myReports`;
  fs.ensureDirSync(userFiles);

  const template = `${global.__basedir}/files/templates/informe_completo/v2/informe_completo_ver1.docx`;

  const templateExists = await fs.exists(template);
  if (!templateExists) {
    return res.json({
      ok: false,
      message: "Ocurrio un error al crear el archivo",
    });
  }

  const output = `${userFiles}/complete_report.docx`;
  const outputPdf = `${userFiles}/complete_report.pdf`;
  // obtener informacion de modelos
  const tests = await Test.find({ author: userId });

  // verificamos si no existen test
  if (!tests.length) {
    return res.json({
      ok: false,
      message:
        "Realizar las pruebas de Personalidad, Razonamiento Lógico y Comunicación Efectiva",
    });
  }

  let donatello = tests.find((t) => t.tipo === NAME_DONATELLO);
  let bap7 = tests.find((t) => t.tipo === NAME_BAP7);
  let asertividad = tests.find((t) => t.tipo === NAME_ASERTIVIDAD);

  if (!donatello) {
    return res.json({
      ok: false,
      message: "Por favor, completa la prueba de Personalidad.",
    });
  }
  if (!bap7) {
    return res.json({
      ok: false,
      message: "Por favor, completa la prueba de Razonamiento Lógico.",
    });
  }
  if (!asertividad) {
    return res.json({
      ok: false,
      message: "Por favor, completa la prueba de Comunicación Efectiva.",
    });
  }

  // const plotlyService = new PlotlyService(req);
  // const pathDonatello = await plotlyService.imgDonatelloBH(donatello);
  // const pathAsertividad = await plotlyService.imgAsertividadIN(asertividad);
  // const pathRazonamiento = await plotlyService.imgRazonamientoIN(bap7);

  // await existFile(pathDonatello, res);
  // await existFile(pathAsertividad, res);
  // await existFile(pathRazonamiento, res);

  const user = await User.findOne({ _id: userId });
  const userInfo = await UserSelectionInfo.findOne({ author: userId });

  if (!userInfo) {
    return res.json({ ok: false, message: "Por favor, complete su perfil." });
  }

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

  // const imgMedidas = { width: 13, height: 7 };
  await createReport({
    template,
    output,
    data: {
      report: {
        actualDate: format(new Date(), "dd 'de' MMMM yyyy", { locale: es }),
        fullname: `${userInfo.nombre || ""} ${userInfo.paterno || ""} ${
          userInfo.materno || ""
        }`,
        age: getAge(userInfo.fecha_nacimiento),
        code: `${userInfo.dni || ""}`,
        phone: `${userInfo.telefono || ""}`,
        email: `${user.email || ""}`,

        donatelloPattern: `${toCapitalize(donatelloPattern)}` || "",
        // donatelloPatternInterpretation: donatelloPatternInterpretation || "",
        donatelloResume: donatelloPatternInterpretation.resumen || "",
        donatelloParagraphOne: donatelloPatternInterpretation.parrafoUno || "",
        donatelloParagraphTwo: donatelloPatternInterpretation.parrafoDos || "",
        donatelloParagraphThree:
          donatelloPatternInterpretation.parrafoTres || "",
        emocionesCharac: donatelloPatternCharacteristics.emociones || "",
        metaCharac: donatelloPatternCharacteristics.meta || "",
        juzgaCharac: donatelloPatternCharacteristics.juzga || "",
        influyeCharac: donatelloPatternCharacteristics.influye || "",
        valorCharac: donatelloPatternCharacteristics.valor || "",
        abusaCharac: donatelloPatternCharacteristics.abusa || "",
        presionCharac: donatelloPatternCharacteristics.presion || "",
        temeCharac: donatelloPatternCharacteristics.teme || "",
        eficazCharac: donatelloPatternCharacteristics.eficaz || "",
        donatelloFactor: donatelloFactor || "",
        donatelloFactorResume: donatelloFactorInterpretation.resumen || "",
        donatelloFactorParagraphOne:
          donatelloFactorInterpretation.parrafoUno || "",
        donatelloFactorFortalezas:
          donatelloFactorCharacteristics.FortalezasPredominantes,
        donatelloFactorDebilidades:
          donatelloFactorCharacteristics.DebilidadesPredominantes,

        comoSeSiente: donatelloFactorCharacteristics.ComoSeSiente,
        comoLoPuedenVer: donatelloFactorCharacteristics.ComoLoPuedenVer,
        comoRealmenteEs: donatelloFactorCharacteristics.ComoRealmenteEs,
        queValoresAporta: donatelloFactorCharacteristics.QueValoresAporta,
        comoMotivarlo: donatelloFactorCharacteristics.ComoMotivarlo,
        comoHablarle: donatelloFactorCharacteristics.ComoHablarle,
        queLeDebeOfrecerSuEntorno:
          donatelloFactorCharacteristics.QueLeDebeOfrecerSuEntorno,
        queAspectosDebeMejorar:
          donatelloFactorCharacteristics.QueAspectosDebeMejorar,

        razonamientoDefinition: Bap7Int[bap7.nivel].definicion,
        razonamientoPercentaje: bap7.porcentaje,
        razonamientoInterpretacionLargaUno:
          Bap7Int[bap7.nivel].interpretacionLargaUno,
        razonamientoInterpretacionLargaDos:
          Bap7Int[bap7.nivel].interpretacionLargaDos,
        razonamientoInterpretacionLargaTres:
          Bap7Int[bap7.nivel].interpretacionLargaTres,

        asertividadPercentaje: asertividad.porcentaje || "-",
        asertividadInterpretacionLargaUno:
          AsertividadInt[asertividad.nivel].interpretacionLargaUno,
        asertividadInterpretacionLargaDos:
          AsertividadInt[asertividad.nivel].interpretacionLargaDos,
        asertividadInterpretacionLargaTres:
          AsertividadInt[asertividad.nivel].interpretacionLargaTres,
      },
    },

    literalXmlDelimiter: "||",
  });

  const enterPath = output;
  const outputPath = outputPdf;
  const file = fs.readFileSync(enterPath);

  const exists = await fs.exists(output);
  if (exists) {
    await convertToPdf(file, outputPath);
    return res.download(outputPdf);
  } else {
    return res.json({
      ok: false,
      message: "Hubo un problema al generar el archivo.",
    });
  }
}
async function createProfessionalProfileReport(req, res) {
  try {
    const { userId } = req.params;
    const userFiles = `${global.__basedir}/files/users/${userId}/documents/myReports`;
    fs.ensureDirSync(userFiles);

    let userInfo = await UserSelectionInfo.findOne({ author: userId });

    if (!userInfo) {
      return res.json({ ok: false, message: "Por favor, complete su perfil." });
    }
    let template = null;
    if (userInfo.sexo === "Masculino") {
      template = `${global.__basedir}/files/templates/informe_perfil_profesional/v2/informe_perfil_profesional_v2_mas.docx`;
    } else {
      template = `${global.__basedir}/files/templates/informe_perfil_profesional/v2/informe_perfil_profesional_v2.docx`;
    }

    const templateExists = await fs.exists(template);
    if (!templateExists) {
      console.log("Wrong template!");
      return res.json({
        ok: false,
        message: "Ocurrio un error al crear el archivo",
      });
    }

    const docxFileName = "professional_profile_report";
    const output = `${userFiles}/${docxFileName}.docx`;
    const outputPdf = `${userFiles}/${docxFileName}.pdf`;

    // obtener informacion de modelos
    const tests = await Test.find({ author: userId });
    // verificamos si no existen test
    if (!tests.length) {
      return res.json({ ok: false, message: "Realizar las pruebas!" });
    }

    let donatello = tests.find((t) => t.tipo === NAME_DONATELLO);
    let bap7 = tests.find((t) => t.tipo === NAME_BAP7);
    let asertividad = tests.find((t) => t.tipo === NAME_ASERTIVIDAD);
    let inteligencia = tests.find((t) => t.tipo === NAME_DARTAGNAN);
    let habilidadesSociales = tests.find((t) => t.tipo === NAME_SOCIAL);
    let liderazgo = tests.find((t) => t.tipo === NAME_LIDERAZGOGOLEN);

    if (!donatello) {
      return res.json({
        ok: false,
        message: "Por favor, completa la prueba de Personalidad.",
      });
    }
    if (!bap7) {
      return res.json({
        ok: false,
        message: "Por favor completa la prueba de Razonamiento Lógico.",
      });
    }
    if (!asertividad) {
      return res.json({
        ok: false,
        message: "Por favor completa la prueba de Comunicación efectiva.",
      });
    }
    if (!inteligencia) {
      return res.json({
        ok: false,
        message: "Por favor completa la prueba de Inteligencia.",
      });
    }
    if (!habilidadesSociales) {
      return res.json({
        ok: false,
        message: "Por favor completa la prueba de Habilidades Sociales.",
      });
    }
    if (!liderazgo) {
      return res.json({
        ok: false,
        message: "Por favor completa la prueba de Liderazgo.",
      });
    }

    const user = await User.findOne({ _id: userId });

    let donatelloPattern = donatello.nivel.trim().toLowerCase();
    let donatelloFactor = getFactor(donatello.detalle);

    let donatelloPatternCharacteristics =
      DonatelloInt.pattern[donatelloPattern].characteristics;

    let donatelloPatternInterpretation =
      DonatelloInt.pattern[donatelloPattern].interpretation;

    let donatelloFactorInterpretation =
      DonatelloInt.factor[donatelloFactor].interpretation;
    let donatelloFactorCharacteristics =
      DonatelloInt.factor[donatelloFactor].characteristics;

    let inteligenciaInt = DartagnanInt[inteligencia.nivel.toLowerCase()];
    let asertividadInt = AsertividadInt[asertividad.nivel];

    let LiderazgoObj = LiderazgoInt[liderazgo.nivel.toUpperCase()];

    await createReport({
      template,
      output,
      data: {
        report: {
          actualDate: format(new Date(), "dd 'de' MMMM yyyy", { locale: es }),
          fullname: `${userInfo.nombre || ""} ${userInfo.paterno || ""} ${
            userInfo.materno || ""
          }`,
          age: getAge(userInfo.fecha_nacimiento),
          code: `${userInfo.dni || ""}`,
          phone: `${userInfo.telefono || ""}`,
          email: `${user.email || ""}`,

          donatelloPattern: `${toCapitalize(donatelloPattern)}` || "",
          // donatelloPatternInterpretation: donatelloPatternInterpretation || "",
          donatelloResume: donatelloPatternInterpretation.resumen || "",
          donatelloParagraphOne:
            donatelloPatternInterpretation.parrafoUno || "",
          donatelloParagraphTwo:
            donatelloPatternInterpretation.parrafoDos || "",
          donatelloParagraphThree:
            donatelloPatternInterpretation.parrafoTres || "",
          emocionesCharac: donatelloPatternCharacteristics.emociones || "",
          metaCharac: donatelloPatternCharacteristics.meta || "",
          juzgaCharac: donatelloPatternCharacteristics.juzga || "",
          influyeCharac: donatelloPatternCharacteristics.influye || "",
          valorCharac: donatelloPatternCharacteristics.valor || "",
          abusaCharac: donatelloPatternCharacteristics.abusa || "",
          presionCharac: donatelloPatternCharacteristics.presion || "",
          temeCharac: donatelloPatternCharacteristics.teme || "",
          eficazCharac: donatelloPatternCharacteristics.eficaz || "",
          donatelloFactor: toCapitalize(donatelloFactor) || "",
          donatelloFactorResume: donatelloFactorInterpretation.resumen || "",
          donatelloFactorParagraphOne:
            donatelloFactorInterpretation.parrafoUno || "",
          donatelloFactorFortalezas:
            donatelloFactorCharacteristics.FortalezasPredominantes,
          donatelloFactorDebilidades:
            donatelloFactorCharacteristics.DebilidadesPredominantes,

          comoSeSiente: donatelloFactorCharacteristics.ComoSeSiente,
          comoLoPuedenVer: donatelloFactorCharacteristics.ComoLoPuedenVer,
          comoRealmenteEs: donatelloFactorCharacteristics.ComoRealmenteEs,
          queValoresAporta: donatelloFactorCharacteristics.QueValoresAporta,
          comoMotivarlo: donatelloFactorCharacteristics.ComoMotivarlo,
          comoHablarle: donatelloFactorCharacteristics.ComoHablarle,
          queLeDebeOfrecerSuEntorno:
            donatelloFactorCharacteristics.QueLeDebeOfrecerSuEntorno,
          queAspectosDebeMejorar:
            donatelloFactorCharacteristics.QueAspectosDebeMejorar,

          inteligenciaPuntaje: inteligencia.puntaje,
          inteligenciaResumen: inteligenciaInt.resumen,
          inteligenciaInterpretacionPersona:
            inteligenciaInt.interpretacionPersona,
          inteligenciaInterpretacion: inteligenciaInt.interpretacion,

          asertividadPuntaje: asertividad.puntaje || 0,
          asertividadNivel: asertividad.nivel || "No definido",
          asertividadSeguirMejorando: asertividadInt.seguirMejorando,
          asertividadInterpretacionLargaUno:
            asertividadInt.interpretacionLargaUno,
          asertividadInterpretacionLargaDos:
            asertividadInt.interpretacionLargaDos,
          asertividadInterpretacionLargaTres:
            asertividadInt.interpretacionLargaTres,
          // Habilidades Sociales
          habilidadesSocialesSentimientosNivel:
            habilidadesSociales.detalle[0].nivel,
          habilidadesSocialesAgresionNivel:
            habilidadesSociales.detalle[1].nivel,
          habilidadesSocialesEstresNivel: habilidadesSociales.detalle[2].nivel,
          habilidadesSocialesPlanificacionNivel:
            habilidadesSociales.detalle[3].nivel,

          habilidadesSocialesSentimientosInterpretation:
            habilidadesSociales.detalle[0].interpretacion,
          habilidadesSocialesAgresionInterpretation:
            habilidadesSociales.detalle[1].interpretacion,
          habilidadesSocialesEstresInterpretation:
            habilidadesSociales.detalle[2].interpretacion,
          habilidadesSocialesPlanificacionInterpretation:
            habilidadesSociales.detalle[3].interpretacion,

          // Liderazgo

          liderazgoName: LiderazgoObj.name,
          liderazgoLargeInterpretation: LiderazgoObj.interpretacionLarga,
          liderazgoLema: LiderazgoObj.lema,
          liderazgoCharacteristic: LiderazgoObj.caracteristicas,
          emotionalCompetences: LiderazgoObj.competenciasEmocionales,
          strength: LiderazgoObj.fortalezas,
          areaImprovement: LiderazgoObj.aspectosMejora,
        },
      },
      literalXmlDelimiter: "||",
    });

    const enterPath = output;
    const outputPath = outputPdf;
    const file = fs.readFileSync(enterPath);
    const exists = await fs.exists(output);

    if (exists) {
      await convertToPdf(file, outputPath);
      return res.download(outputPdf);
    } else {
      return res.json({
        ok: false,
        message: "Hubo un problema al generar el archivo.",
      });
    }
  } catch (error) {
    console.log("Error:", error);
    return res.json({
      ok: false,
      message: "Hubo un problema al generar el archivo.",
    });
  }
}

export default {
  createFreeReport,
  createCompleteReport,
  createProfessionalProfileReport,
};
