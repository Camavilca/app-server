import UserInfo from "../../models/UserInfo";
import createReport from "docx-templates";
import Document from "../../models/Document";
import BandaPorSexo from "../../models/BandaPorSexo";
import Cv from "../../models/Cv";
import Keyword from "../../models/Keyword";
import Puntaje from "../../models/Puntaje";
import HelperClass from "./helper";
import config from "../../config";
import plotlyServer from "plotly";
import fs from "fs-extra";
import { romanize } from "../../util/helpers";
import docNameArr from "./documentos/politicas";
import { REALIZADO } from "../../constant/selection/postulante/test/estados";
import { CRITERIA } from "../../constant/selection/postulante/test/calculo";
import { DESCRIPCION } from "../../constant/equality/empresa/documentos/names";
import Politica from "../../models/Politicas";
import Planilla from "../../models/Planilla";
import Banda from "../../models/Banda";
import Sustento from "../../models/Sustento";
import runScriptR from "../../util/runScriptR";

export default class DocumentClass {
  constructor(req) {
    this.plotly = plotlyServer({
      username: config.plotly.user,
      apiKey: config.plotly.key,
      host: "chart-studio.plotly.com",
    });
    let author = req.session.user.userId;
    let files = `${__basedir}/files/users`;
    let authorFiles = `${files}/${author}`;

    this.userAuthor = req.session.user.author;
    this.userSesion = req.session.user.userId;
    this.role = req.session.user.role;

    this.req = req;
    this.basePath =
      req.session.user && author
        ? `${authorFiles}/documents/`
        : `${__basedir}/files/other/`;

    this.imgBanda = `${authorFiles}/images/Banda.png`;
    this.imgPuntos = `${authorFiles}/images/Puntos.png`;
    this.imgCompensacion = `${authorFiles}/images/Compensacion.png`;
    this.imgXGenero = `${authorFiles}/images/PorGenero.png`;

    this.planillaPath = `${files}/${req.session.user.userId}/documents/planilla.xlsx`;
    this.ponderacionPath = `${files}/${req.session.user.userId}/documents/ponderacion.xlsx`;
    this.factoresPath = `${__basedir}/files/placeholders/factores.xlsx`;
  }
}

DocumentClass.prototype.rateCv = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const allCv = await Cv.find();
      const allKeyword = await Keyword.find();

      for (let x in allKeyword) {
        const keyword = allKeyword[x];
        for (let j in allCv) {
          const cv = allCv[j];
          const words = HelperClass.kwSanitize(cv.words);
          let puntaje = 0;

          for (let i in keyword.keywords) {
            const kw = keyword.keywords[i];
            const key = HelperClass.kwSanitize(kw[0], 2);
            const val = kw[1];

            if (words.includes(key)) {
              puntaje += parseInt(val);
            }
          }

          let updatedCv = await Cv.findById(cv._id).populate({
            path: "puntajes",
          });

          let foundPuntaje = await Puntaje.findOne({
            cv: cv._id,
            puesto: keyword.puesto,
          });

          if (foundPuntaje || foundPuntaje !== null) {
            foundPuntaje.puntaje = puntaje;
            foundPuntaje.nivel = keyword.nivel || null;
            foundPuntaje.category = keyword.category || null;
            await foundPuntaje.save();
          } else {
            const puntajeObj = await Puntaje.create({
              cv: cv._id,
              puntaje,
              puesto: keyword.puesto,
              nivel: keyword.nivel || null,
              category: keyword.category || null,
            });
            updatedCv.puntajes = updatedCv.puntajes
              ? [...updatedCv.puntajes, puntajeObj]
              : [puntajeObj];

            await updatedCv.save();
          }
        }
      }
      let updated = await Cv.find().populate({ path: "puntajes" });
      return resolve({ ok: true, data: updated });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.createPolitica = function (formData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { datos, type } = formData;
      let author = this.req.session.user.userId;
      let politica = await Politica.create({
        author: author,
        respuestas: datos,
        tipo: type,
        estado: REALIZADO,
      });
      return resolve({ ok: true, data: politica });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.getPoliticas = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const politicas = await Politica.find({
        author: this.req.session.user.userId,
      });
      return resolve({ ok: true, data: politicas });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.generateDocumentImages = function () {
  return new Promise((resolve, reject) => {
    runScriptR(
      {
        planillaPath: this.planillaPath,
        ponderacionPath: this.ponderacionPath,
        factoresPath: this.factoresPath,
        bandasPath: this.imgPuntos,
        modeloPath: this.imgCompensacion,
        equidadPath: this.imgXGenero,
      },
      `${__basedir}/R/createImagesDocument.R`
    )
      .then((out) => {
        resolve(true);
      })
      .catch((err) => {
        reject(false);
      });
  });
};

DocumentClass.prototype.GetBandaImage = function (bandas) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = [];
      for (var index in bandas) {
        const banda = bandas[index];
        data.push({
          y: [banda.minSueldo, banda.maxSueldo],
          name: banda.nombre,
          marker: { color: "#2B2E83" },
          type: "box",
        });
      }

      var figure = { data };
      var imgOpts = {
        format: "png",
        width: 2000,
        height: 1000,
      };
      this.plotly.getImage(figure, imgOpts, async (err, imageStream) => {
        if (err) {
          return reject({
            ok: false,
            message: "Error en el método GetBandaImage",
          });
        }

        var fileStream = fs.createWriteStream(this.imgBanda);
        await imageStream.pipe(fileStream);

        return resolve({
          ok: true,
        });
      });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.GetBandaPuntosCompensacionImage = function (planilla) {
  return new Promise(async (resolve, reject) => {
    try {
      const puntos = planilla.workers.map((w) => w.puntos);
      const sueldos = planilla.workers.map((w) => w.sueldoBruto);

      let shapes = [];

      const bandas = await Banda.find({
        author: this.req.session.user.userId,
      }).sort({
        minPuntos: 1,
      });

      for (const banda of bandas) {
        shapes.push({
          type: "rect",
          xref: "x",
          yref: "y",
          x0: banda.minPuntos,
          x1: banda.maxPuntos,
          y0: banda.minSueldo,
          y1: banda.maxSueldo,
          fillcolor: "#4797b1",
          opacity: 0.5,
          line: {
            width: 1,
          },
        });
      }

      const trace = {
        x: puntos,
        y: sueldos,
        mode: "markers",
        type: "scatter",
        barmode: "stack",
        marker: { size: 12 },
      };

      var layout = {
        title: { text: "Banda Salarial", font: { size: 48 } },
        legend: { traceorder: "reversed" },
        shapes,
        xaxis: {
          title: { text: "Puntos", font: { size: 48 } },
          tickfont: { size: 24 },
          automargin: true,
        },
        yaxis: {
          title: { text: "Remuneracion", font: { size: 48 } },
          tickfont: { size: 24 },
          automargin: true,
        },
      };

      const figure = {
        data: [trace],
        layout,
      };

      const imgOpts = {
        format: "png",
        width: 2000,
        height: 1000,
      };

      this.plotly.getImage(figure, imgOpts, async (err, imageStream) => {
        if (err) {
          return reject({
            ok: false,
            message: "Error en el método GetBandaPuntosCompensacionImage",
          });
        }
        const fileStream = fs.createWriteStream(this.imgCompensacion);
        await imageStream.pipe(fileStream);

        return resolve({
          ok: true,
        });
      });
    } catch (err) {
      console.error(err);
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.GetPuntosCompensacionImage = function (planilla) {
  return new Promise(async (resolve, reject) => {
    try {
      const sueldos = planilla.workers.map((w) => w.sueldoBruto);
      const puntos = planilla.workers.map((w) => w.puntos);

      const trace = {
        x: puntos,
        y: sueldos,
        mode: "markers",
        type: "scatter",
        marker: { size: 12 },
      };

      const layout = {
        title: {
          text: "Grafico de Puntos vs Compensacion",
          font: { size: 48 },
        },
        xaxis: {
          autorange: true,
          title: { text: "Puntos", font: { size: 48 } },
          tickfont: { size: 24 },
          automargin: true,
        },
        yaxis: {
          autorange: true,
          title: { text: "Compensacion", font: { size: 48 } },
          tickfont: { size: 24 },
          automargin: true,
        },
      };

      const figure = {
        data: [trace],
        layout,
      };

      const imgOpts = {
        format: "png",
        width: 2000,
        height: 1000,
      };

      this.plotly.getImage(figure, imgOpts, async (err, imageStream) => {
        if (err) {
          return reject({
            ok: false,
            message: "Error en el método GetPuntosCompensacionImage",
          });
        }
        const fileStream = fs.createWriteStream(this.imgPuntos);
        await imageStream.pipe(fileStream);

        return resolve({
          ok: true,
        });
      });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.GetPuntosCompensacionPorGeneroImage = function (
  planilla,
  bandasPorSexo
) {
  return new Promise(async (resolve, reject) => {
    try {
      const puntos = planilla.workers.map((w) => w.puntos);
      const sueldos = planilla.workers.map((w) => w.sueldoBruto);

      const male = "M";
      const female = "F";

      let shapes = [];

      for (const banda of bandasPorSexo) {
        shapes.push({
          type: "rect",
          xref: "x",
          yref: "y",
          x0: banda.minPuntos,
          x1: banda.maxPuntos,
          y0: banda.minLimite,
          y1: banda.maxLimite,
          fillcolor: banda.bandaGenero === male ? "#4797b1" : "#bb3da5",
          opacity: 0.5,
          line: {
            width: 1,
          },
        });
      }

      const trace = {
        x: puntos,
        y: sueldos,
        mode: "markers",
        type: "scatter",
        barmode: "stack",
        marker: { size: 12 },
      };

      var layout = {
        title: { text: "Banda Salarial", font: { size: 48 } },
        legend: { traceorder: "reversed" },
        shapes,
        xaxis: {
          title: { text: "Puntos", font: { size: 48 } },
          tickfont: { size: 24 },
          autorange: true,
        },
        yaxis: {
          title: { text: "Remuneracion", font: { size: 48 } },
          tickfont: { size: 24 },
          autorange: true,
        },
      };

      const figure = {
        data: [trace],
        layout,
      };

      const imgOpts = {
        format: "png",
        width: 2000,
        height: 1000,
      };

      this.plotly.getImage(figure, imgOpts, async (err, imageStream) => {
        if (err) {
          return reject({
            ok: false,
            message: "Error en el método GetPuntosCompensacionPorGeneroImage",
          });
        }
        const fileStream = fs.createWriteStream(this.imgXGenero);
        await imageStream.pipe(fileStream);

        return resolve({
          ok: true,
        });
      });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.createDocumentsPoliticas = function (documento) {
  return new Promise(async (resolve, reject) => {
    try {
      const author =
        this.role === "SubUser" ? this.userAuthor : this.userSesion;
      const userInfo = await UserInfo.findOne({ author: author });
      if (!userInfo)
        return reject({
          ok: false,
          message: "Por favor complete su perfil",
        });
      const { isView, type, nombre } = documento;
      await Document.create({
        author: author,
        nombre: nombre,
        isView: isView,
        type: type,
        route: this.basePath + nombre,
      });
      const documents = await Document.find({ author: author });
      return resolve({ ok: true, data: documents });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

DocumentClass.prototype.createDocuments = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const author =
        this.role === "SubUser" ? this.userAuthor : this.userSesion;

      const userInfo = await UserInfo.findOne({ author: author });

      if (!userInfo)
        return reject({
          ok: false,
          message: "Por favor complete su perfil",
        });

      const politicas = await Politica.find({ author: author });
      const bandas = await Banda.find({ author: author });
      const bandasForSex = await BandaPorSexo.find({ author: author });

      if (
        bandas.length <= 0 ||
        bandas === null ||
        typeof bandas === "undefined"
      )
        return reject({
          ok: false,
          message: "HCP está trabajando en colocar los puntos a los puestos.",
        });

      const planilla = await Planilla.findOne({ author: author }).populate({
        path: "workers",
      });

      const sustentos = await Sustento.findOne({ planilla: planilla._id });
      const arrTypeDES = politicas.filter((e) => e.tipo === DESCRIPCION)[0];

      const defNameEmpresa = { nombreEmpresa: userInfo.nombre };

      const replys = [
        { caratula: defNameEmpresa },
        {
          descripcion:
            typeof arrTypeDES !== "undefined"
              ? funDescripcion(arrTypeDES.respuestas, userInfo.nombre)
              : defNameEmpresa,
        },
        {
          renumerativa: funRenumerativa(
            sustentos,
            bandasForSex,
            bandas,
            planilla.workers,
            userInfo.nombre
          ),
        },
        { ascensos: defNameEmpresa },
        { hostigamiento: defNameEmpresa },
        { capacitacion: defNameEmpresa },
        { conciliacion: defNameEmpresa },
        { anexo: defNameEmpresa },
      ];

      let isImagesGenerated = await this.generateDocumentImages();

      if (!isImagesGenerated) {
        return reject({
          ok: false,
          message: "Las imagenes no se generaron correctamente. (R)",
        });
      }

      // let img01 = await this.GetBandaImage(bandas);
      // let img02 = await this.GetBandaPuntosCompensacionImage(planilla);
      // let img03 = await this.GetPuntosCompensacionImage(planilla);
      // let img04 = await this.GetPuntosCompensacionPorGeneroImage(
      //   planilla,
      //   bandasForSex
      // );

      // if (img01.ok === false) return reject(img01);
      // if (img02.ok === false) return reject(img02);
      // if (img03.ok === false) return reject(img03);
      // if (img04.ok === false) return reject(img04);

      const imgMedidas = { width: 13, height: 7 };

      const path = __basedir + "/files/users/" + author + "/images/profile.png";

      if (!fs.pathExistsSync(path))
        return reject({
          ok: false,
          message: "Tiene que subir su perfil",
        });

      for (var i in docNameArr) {
        const docName = docNameArr[i].name;
        const data = replys[i];

        await createReport({
          template: __basedir + "/files/doc-themes/" + docName,
          output: this.basePath + docName,
          data,
          additionalJsContext: {
            logo: {
              width: 2,
              height: 2,
              path: path,
            },
            // La img01 no se esta usando en el reporte
            img01: {
              ...imgMedidas,
              path: this.imgBanda,
            },
            img02: {
              ...imgMedidas,
              path: this.imgPuntos,
            },
            img03: {
              ...imgMedidas,
              path: this.imgCompensacion,
            },
            img04: {
              ...imgMedidas,
              path: this.imgXGenero,
            },
          },
        });

        try {
          await Document.create({
            author: author,
            nombre: docName,
            type: docNameArr[i].type,
            isView: docNameArr[i].isView,
            route: this.basePath + docName,
          });
        } catch (error) {
          return reject({ ok: false, message: err.message });
        }
      }

      const documents = await Document.find({ author: author });

      return resolve({ ok: true, data: documents });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

const funDescripcion = (arr, empresa) => {
  return {
    introduccion: arr[0].respuesta,
    mision: arr[1].respuesta,
    vision: arr[2].respuesta,
    valores: arr[3].respuesta,
    nombreEmpresa: empresa,
  };
};

const funRenumerativa = (sustentos, bandasForSex, bandas, workers, empresa) => {
  const newBandas = bandas.map((item, index) => {
    item.categoria = romanize(index + 1);
    return item;
  });

  return {
    bandas: newBandas,
    workers: getJobDetailsTable(workers),
    nombreEmpresa: empresa,
  };
};

const getJobDetailsTable = (workers) => {
  let result = [];
  let { notRepeated } = HelperClass.getDistinctField(workers, "puesto");

  let workersByJob = {};

  for (let i = 0; i < notRepeated.length; i++) {
    for (let j = 0; j < workers.length; j++) {
      let worker = workers[j];
      let puesto = worker.puesto;

      if (notRepeated[i] === puesto) {
        workersByJob[puesto] = Object.keys(workersByJob).some(
          (wpuesto) => wpuesto === puesto
        )
          ? [...workersByJob[puesto], worker]
          : [worker];
      }
    }
  }

  Object.keys(workersByJob).map((puesto, index) => {
    let salaries = workersByJob[puesto].map((w) => w.sueldoBruto);
    result.push({
      puesto: puesto,
      promedio: HelperClass.media(salaries),
      mediana: HelperClass.mediana(salaries),
      minimoSueldo: HelperClass.getMin(salaries),
      maximoSueldo: HelperClass.getMax(salaries),
      minimoEsperado: HelperClass.getMinLimit(salaries, CRITERIA),
      maximoEsperado: HelperClass.getMaxLimit(salaries, CRITERIA),
    });
  });

  return result;
};
