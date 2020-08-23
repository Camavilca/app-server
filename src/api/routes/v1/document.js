import express from "express";
import Document from "../../../models/Document";
import Factor from "../../../models/Factor";
import Planilla from "../../../models/Planilla";
import Ponderacion from "../../../models/Ponderacion";
import Banda from "../../../models/Banda";
import Worker from "../../../models/Worker";
import Edited from "../../../models/Edited";
import StreamZip from "node-stream-zip";
import fs from "fs-extra";
import { reporte } from "../../../util/createReporte.js";
import { createDashboardHtml } from "../../../util/createDashboard";
import createReport from "docx-templates";
import plotlyServer from "plotly";
import config from "../../../config";
import DocumentClass from "../../../controllers/v1/documents";
import UploadClass from "../../../controllers/v1/upload";
import DocxMerger from "docx-merger";
import { CRITERIA } from "../../../constant/selection/postulante/test/calculo";
import UserInfo from "../../../models/UserInfo";
import HistorialReporte from "../../../models/HistorialReporte";

const documentRouter = express.Router();

function DocumentObj(req) {
  const plotly = plotlyServer({
    username: config.plotly.user,
    apiKey: config.plotly.key,
    host: "chart-studio.plotly.com",
  });

  let author = req.session.user.userId;
  let files = `${__basedir}/files`;
  let authorFiles = `${files}/users/${author}`;

  const ReporteTheme = __basedir + "/files/ReporteFinal.docx";
  const bandaPath = `${authorFiles}/images/Banda.jpg`;
  const puntosCompensacionPath = `${authorFiles}/images/puntosCompensacion.jpg`;
  const bandaPuntosCompensacionPath = `${authorFiles}/images/bandaPuntosCompensacion.jpg`;
  const puntosCompensacionPorGeneroPath = `${authorFiles}/images/bandaPuntosPorGeneroCompensacion.jpg`;
  const ReporteOutput = `${authorFiles}/documents/Reporte.docx`;

  const Open = (filePath) => {
    return new Promise((resolve, reject) => {
      const zip = new StreamZip({
        file: filePath,
        storeEntries: true,
      });

      zip.on("ready", () => {
        var chunks = [];
        var content = "";
        zip.stream("word/document.xml", (err, stream) => {
          if (err) {
            reject({ ok: false, message: err.message });
          }
          stream.on("data", function (chunk) {
            chunks.push(chunk);
          });
          stream.on("end", function () {
            content = Buffer.concat(chunks);
            zip.close();
            resolve(content.toString());
          });
        });
      });
    });
  };

  const SpecificTextToArr = (text, specific, force = false) => {
    return new Promise(async (resolve, reject) => {
      try {
        const start = text.indexOf(specific[0]);
        let end = text.indexOf(specific[1]);

        if (force) {
          end = text.length;
        }

        if (start === -1 || end === -1) {
          return reject({
            ok: false,
            message: `asegurese que los documentos tienen el formato correcto ${specific[0]} ${specific[1]}`,
          });
        }

        let str = text.substring(start, end);

        str = str.replace(specific[0], "");

        return resolve({ ok: true, data: str });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  const GetTextFromDocs = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const documents = await Document.find({
          author: req.session.user.userId,
        }).sort({ nombre: 1 });

        if (documents.length < 6)
          return reject({
            ok: false,
            message: "por favor suba todos los documentos",
          });

        let data = [];
        for (let i in documents) {
          const response = await this.extract(documents[i].route, "");
          if (response.ok === false) return reject(response);
          const text = response.data;

          for (let j in reporte[i]) {
            let force = +j === reporte[i].length - 1 ? true : false;
            const str = await SpecificTextToArr(text, reporte[i][j], force);
            if (str.ok === false) return reject(str);
            data.push(str.data);
          }
        }

        return resolve({ ok: true, data });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  const GetBandaImage = (bandas) => {
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
          width: 1280,
          height: 720,
        };
        plotly.getImage(figure, imgOpts, async (err, imageStream) => {
          if (err)
            return reject({
              ok: false,
              message: "Ocurrio un error al crear el grafico",
            });

          var fileStream = fs.createWriteStream(bandaPath);
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

  const GetBandaPuntosCompensacionImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const planillas = await Planilla.findOne({
          author: req.session.user.userId,
        }).populate({ path: "workers" });

        const bands = [
          [200, 300],
          [301, 400],
          [401, 550],
          [551, 700],
          [701, 850],
          [851, 1000],
        ];

        const puntos = planillas.workers.map((w) => w.puntos);
        const sueldos = planillas.workers.map((w) => w.sueldoBruto);

        const workers = planillas.workers.map((w) => ({
          points: w.puntos,
          gender: w.genero,
          salary: w.sueldoBruto,
        }));

        // const male = "M";
        // const female = "F";

        // const workersByMale = workers.filter(w => w.gender === male);
        // const workersByFemale = workers.filter(w => w.gender === female);

        const workersByBands = [];
        // const femaleWorkersByBands = [];

        for (let i = 0; i < bands.length; i++) {
          let range = [];
          for (let j = 0; j < workers.length; j++) {
            if (
              bands[i][0] <= workers[j].points &&
              bands[i][1] >= workers[j].points
            ) {
              range.push(workers[j]);
            }
          }
          workersByBands.push(range);
          range = [];
        }

        function getMediana(arr) {
          const len = arr.length;
          let result;
          arr.sort();

          if (len === 0) return null;
          if (len === 1) return arr[0];

          len % 2 === 0
            ? (result =
                (arr[Math.round(len / 2 - 1)] + arr[Math.round(len / 2)]) / 2)
            : (result = arr[Math.round(len / 2 - 1)]);
          return result;
        }

        let shapes = [];
        workersByBands.forEach((band, index) => {
          let workers = band.map((w) => w.salary);
          let medianSalary = getMediana(workers);
          const range = CRITERIA * medianSalary;
          const verticalSuperiorLimit = medianSalary + range;
          const verticalInferiorLimit = medianSalary - range;
          const horizontalStartLimit = bands[index][0];
          const horizontalEndLimit = bands[index][1];

          shapes.push({
            type: "rect",
            xref: "x",
            yref: "y",
            x0: horizontalStartLimit,
            x1: horizontalEndLimit,
            y0: verticalInferiorLimit,
            y1: verticalSuperiorLimit,
            fillcolor: "#4797b1",
            opacity: 0.5,
            line: {
              width: 1,
            },
          });
        });

        const trace = {
          x: puntos,
          y: sueldos,
          mode: "markers",
          type: "scatter",
          barmode: "stack",
          marker: { size: 12 },
        };

        var layout = {
          title: { text: "Banda Salarial" },
          legend: { traceorder: "reversed" },
          shapes,
          xaxis: { title: { text: "Puntos" } },
          yaxis: { title: { text: "Remuneracion" } },
        };

        const figure = {
          data: [trace],
          layout,
        };

        const imgOpts = {
          format: "png",
          width: 1280,
          height: 720,
        };

        plotly.getImage(figure, imgOpts, async (err, imageStream) => {
          if (err) {
            return reject({
              ok: false,
              message: "Ocurrió un error al crear el gráfico",
            });
          }
          const fileStream = fs.createWriteStream(bandaPuntosCompensacionPath);
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

  const GetPuntosCompensacionImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const planillas = await Planilla.findOne({
          author: req.session.user.userId,
        }).populate({ path: "workers" });

        const y = planillas.workers.map((w) => w.sueldoBruto);
        const x = planillas.workers.map((w) => w.puntos);

        const trace = {
          x,
          y,
          mode: "markers",
          type: "scatter",
          marker: { size: 12 },
        };

        const layout = {
          xaxis: { autorange: true, title: { text: "Puntos" } },
          yaxis: { autorange: true, title: { text: "Compensacion" } },
          title: { text: "Grafico de Puntos vs Compensacion", size: 18 },
        };

        const figure = {
          data: [trace],
          layout,
        };

        const imgOpts = {
          format: "png",
          width: 1280,
          height: 720,
        };
        plotly.getImage(figure, imgOpts, async (err, imageStream) => {
          if (err) {
            return reject({
              ok: false,
              message: "Ocurrió un error al crear el gráfico",
            });
          }
          const fileStream = fs.createWriteStream(puntosCompensacionPath);
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

  const GetPuntosCompensacionPorGeneroImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const planillas = await Planilla.findOne({
          author: req.session.user.userId,
        }).populate({ path: "workers" });

        const bands = [
          [200, 300],
          [301, 400],
          [401, 550],
          [551, 700],
          [701, 850],
          [851, 1000],
        ];

        const puntos = planillas.workers.map((w) => w.puntos);
        const sueldos = planillas.workers.map((w) => w.sueldoBruto);

        const workers = planillas.workers.map((w) => ({
          points: w.puntos,
          gender: w.genero,
          salary: w.sueldoBruto,
        }));

        const male = "M";
        const female = "F";

        const workersByMale = workers.filter((w) => w.gender === male);
        const workersByFemale = workers.filter((w) => w.gender === female);

        const maleWorkersByBands = [];
        const femaleWorkersByBands = [];

        for (let i = 0; i < bands.length; i++) {
          let maleRange = [];
          for (let j = 0; j < workersByMale.length; j++) {
            if (
              bands[i][0] <= workersByMale[j].points &&
              bands[i][1] >= workersByMale[j].points
            ) {
              maleRange.push(workersByMale[j]);
            }
          }
          maleWorkersByBands.push(maleRange);

          let femaleRange = [];
          for (let j = 0; j < workersByFemale.length; j++) {
            if (
              bands[i][0] <= workersByFemale[j].points &&
              bands[i][1] >= workersByFemale[j].points
            ) {
              femaleRange.push(workersByFemale[j]);
            }
          }
          femaleWorkersByBands.push(femaleRange);

          maleRange = [];
          femaleRange = [];
        }

        function getMediana(arr) {
          const len = arr.length;
          let result;
          arr.sort();

          if (len === 0) return null;
          if (len === 1) return arr[0];

          len % 2 === 0
            ? (result =
                (arr[Math.round(len / 2 - 1)] + arr[Math.round(len / 2)]) / 2)
            : (result = arr[Math.round(len / 2 - 1)]);
          return result;
        }

        let shapes = [];
        maleWorkersByBands.forEach((band, index) => {
          let workers = band.map((w) => w.salary);
          let medianSalary = getMediana(workers);
          const range = CRITERIA * medianSalary;
          const verticalSuperiorLimit = medianSalary + range;
          const verticalInferiorLimit = medianSalary - range;
          const horizontalStartLimit = bands[index][0];
          const horizontalEndLimit = bands[index][1];

          shapes.push({
            type: "rect",
            xref: "x",
            yref: "y",
            x0: horizontalStartLimit,
            x1: horizontalEndLimit,
            y0: verticalInferiorLimit,
            y1: verticalSuperiorLimit,
            fillcolor: "#4797b1",
            opacity: 0.5,
            line: {
              width: 1,
            },
          });
        });

        femaleWorkersByBands.forEach((band, index) => {
          let workers = band.map((w) => w.salary);
          let medianSalary = getMediana(workers);
          const range = CRITERIA * medianSalary;
          const verticalSuperiorLimit = medianSalary + range;
          const verticalInferiorLimit = medianSalary - range;
          const horizontalStartLimit = bands[index][0];
          const horizontalEndLimit = bands[index][1];

          shapes.push({
            type: "rect",
            xref: "x",
            yref: "y",
            x0: horizontalStartLimit,
            x1: horizontalEndLimit,
            y0: verticalInferiorLimit,
            y1: verticalSuperiorLimit,
            fillcolor: "#ffffff",
            opacity: 0.5,
            line: {
              width: 1,
            },
          });
        });

        const trace = {
          x: puntos,
          y: sueldos,
          mode: "markers",
          type: "scatter",
          barmode: "stack",
          marker: { size: 12 },
        };

        var layout = {
          title: { text: "Banda Salarial" },
          legend: { traceorder: "reversed" },
          shapes,
          xaxis: { title: { text: "Puntos" } },
          yaxis: { title: { text: "Remuneracion" } },
        };

        const figure = {
          data: [trace],
          layout,
        };

        const imgOpts = {
          format: "png",
          width: 1280,
          height: 720,
        };

        plotly.getImage(figure, imgOpts, async (err, imageStream) => {
          if (err) {
            return reject({
              ok: false,
              message: "Ocurrió un error al crear el gráfico",
            });
          }
          const fileStream = fs.createWriteStream(
            puntosCompensacionPorGeneroPath
          );
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

  const PlanillaReporte = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const planillas = await Planilla.find({
          author: req.session.user.userId,
        })
          .populate({ path: "workers" })
          .sort({ createdAt: -1 });
        const planilla = planillas[0].workers;
        let puestos = planilla
          .map((p) => p.cargo)
          .filter((value, index, self) => {
            return self.indexOf(value) === index;
          });
        let newPlanilla = [];

        for (let i in planilla) {
          const p = planilla[i];
          for (let j in puestos) {
            const puesto = puestos[j];
            if (p.cargo === puesto) {
              const compensacion = Math.round(
                p.bonoGratificacion + p.gratificacion + p.sueldoBruto + p.bono
              );
              newPlanilla[puesto]
                ? newPlanilla[puesto].push(compensacion)
                : (newPlanilla[puesto] = [compensacion]);
            }
          }
        }

        let response = [];
        for (let i in newPlanilla) {
          const p = newPlanilla[i];
          response.push({
            puesto: i,
            min: Math.min(...p),
            max: Math.max(...p),
          });
        }

        return resolve({ ok: true, data: response });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.crearReporte = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {};
        const author = req.session.user.userId;

        const factor = await Factor.find({ author: author }).populate({
          path: "subfactor",
        });
        const banda = await Banda.find({ author: author }).sort({
          minPuntos: 1,
        });

        const textArr = await GetTextFromDocs();

        if (textArr.ok === false) return reject(textArr);
        for (let i in textArr.data) {
          data[`obj${i}`] = textArr.data[i].split("\n").join("");
        }

        const bandaImage = await GetBandaImage(banda);
        const puntosCompensacionImage = await GetPuntosCompensacionImage();

        const bandaPuntosCompensacionImage = await GetBandaPuntosCompensacionImage(
          banda
        );

        const puntosCompensacionPorGeneroImage = await GetPuntosCompensacionPorGeneroImage();

        if (bandaImage.ok === false) return reject(bandaImage);
        if (puntosCompensacionImage.ok === false)
          return reject(puntosCompensacionImage);
        if (bandaPuntosCompensacionImage.ok === false) {
          return reject(bandaPuntosCompensacionImage);
        }
        if (puntosCompensacionPorGeneroImage.ok === false) {
          return reject(puntosCompensacionPorGeneroImage);
        }

        const planilla = await PlanillaReporte();
        if (planilla.ok === false) return reject(planilla);

        data["NombreEmpresa"] = req.session.user.username;
        // data["factor"] = factor;
        // data["banda"] = banda;
        // data["planilla"] = planilla.data;

        await createReport({
          template: ReporteTheme,
          output: ReporteOutput,
          data,
          processLineBreaks: true,
          additionalJsContext: {
            bandaSalarial: {
              width: 13,
              height: 7,
              path: bandaPath,
            },
            puntosCompensacion: {
              width: 13,
              height: 7,
              path: puntosCompensacionPath,
            },
            bandaPuntosCompensacion: {
              width: 13,
              height: 9,
              path: bandaPuntosCompensacionPath,
            },
            puntosCompensacionPorGenero: {
              width: 13,
              height: 9,
              path: puntosCompensacionPorGeneroPath,
            },
            logo: {
              width: 13,
              height: 7,
              path:
                __basedir + "/files/users/" + author + "/images/profile.png",
            },
          },
        });

        return resolve({ ok: true });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.crearReporteFinal = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;

        const documents = await Document.find({ author: author });

        if (documents.length < 6)
          return reject({
            ok: false,
            message: "por favor suba todos los documentos",
          });

        let files = [];
        for (let i in documents) {
          files.push(fs.readFileSync(documents[i].route, "binary"));
        }

        var docx = new DocxMerger({}, files);
        docx.save("nodebuffer", (data) => {
          fs.writeFile(ReporteOutput, data, function (err) {});
        });

        const usuario = await UserInfo.findOne({ author: author });
        if (!usuario)
          return reject({
            ok: false,
            message: "Los datos del usuario no existen",
          });

        const historial = await HistorialReporte.findOne({ author: author });
        if (historial && typeof historial !== "undefined" && historial !== null)
          await HistorialReporte.update({ contador: historial.contador + 1 });
        else
          await HistorialReporte.create({
            author: usuario._id,
            nombre: usuario.nombre,
            contador: 1,
            route: ReporteOutput,
          });

        return resolve({ ok: true });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.extract = (filePath, lineBreak) => {
    return new Promise(async (resolve, reject) => {
      try {
        let text = await Open(filePath);

        if (text.ok === false) return reject(text);

        var body = "";
        var components = text.toString().split("<w:t");

        for (var i = 0; i < components.length; i++) {
          var tags = components[i].split(">");
          const content = tags[1].replace(/<.*$/, lineBreak);
          body += content;
        }
        return resolve({ ok: true, data: body.replace(/-&gt;/g, "->") });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.getDocument = (id = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        var documents = await Document.find({
          author: id ? id : req.session.user.userId,
        });
        return resolve({ ok: true, data: documents });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.deleteDocument = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        var document = await Document.findById(id);
        await document.remove();
        await fs.remove(document.route);
        await Edited.deleteMany({ document: document._id });

        return resolve({ ok: true, data: document });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.updateDocument = (id, estado = false, notas = "") => {
    return new Promise(async (resolve, reject) => {
      try {
        const document = await Document.findById(id);
        notas != "" && (await document.updateOne({ $set: { notas, estado } }));
        estado && (await document.updateOne({ $set: { estado, notas: "" } }));
        const updatedDocument = await Document.findById(id);

        return resolve({ ok: true, data: updatedDocument });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
}

//@route -> /api/document/(DocumentId)
//@type -> DELETE
//@desc -> Delete Document
documentRouter.delete("/:id", async (req, res) => {
  try {
    const document = new DocumentObj(req);
    const response = await document.deleteDocument(req.params.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document
//@type -> GET
//@desc -> Get Documents
//query -> id?
documentRouter.get("", async (req, res) => {
  try {
    const document = new DocumentObj(req);
    const response = await document.getDocument(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document
//@type -> PUT
//@desc -> Update Document Notes && False Approve
//@body -> {id:String, notas:String}
documentRouter.put("", async (req, res) => {
  try {
    const { id, notas } = req.body;
    const document = new DocumentObj(req);
    const response = await document.updateDocument(id, false, notas);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document/approve
//@type -> PUT
//@desc -> Approve Document
//@body -> id: String
documentRouter.put("/approve", async (req, res) => {
  try {
    const document = new DocumentObj(req);
    const response = await document.updateDocument(req.body.id, true);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document/download
//@type -> GET
//@desc -> Download Document
//@query-> route: String
documentRouter.get("/download", async (req, res) => {
  const dir = req.query.route;
  if (dir) res.download(dir);
});

//@route -> /api/document/modeloplanilla
//@type -> GET
//@desc -> Download Document Model Planilla
documentRouter.get("/modeloplanilla", async (req, res) => {
  const directorio = __basedir + "/files/ModeloPlanilla.xlsx";
  if (directorio) res.download(directorio);
});

//@route -> /api/document/reporte
//@type -> POST
//@desc -> Create Report
documentRouter.post("/reporte", async (req, res) => {
  try {
    const document = new DocumentObj(req);
    /**
     * @old =>  const response = await document.crearReporte();
     * @input => documentos de las politicas
     * @output => Reporte.docx
     * Union de los documentos del Reporte Final
     */
    const response = await document.crearReporteFinal();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document/reporte
//@type -> GET
//@desc -> Download Report
documentRouter.get("/reporte", (req, res) => {
  const basePath = __basedir + "/files/users/";
  const author = req.session.user.userId;
  const filePath = basePath + author + "/documents/Reporte.docx";
  // const dir =
  //   __basedir +
  //   "/files/users/" +
  //   req.session.user.userId +
  //   "/documents/Reporte.docx";
  if (fs.pathExistsSync(filePath)) res.download(filePath);
});

//@route -> /api/document/dashboard
//@type -> GET
//@desc -> Get the R Dashboard file
documentRouter.get("/dashboard/:id", async (req, res) => {
  const userId = req.params.id || req.session.user.userId;
  const htmlOutputPath = `${__basedir}/files/users/${userId}/documents/dashboard.html`;
  let exitsHtml = await fs.pathExists(htmlOutputPath);
  if (exitsHtml) {
    return res.sendFile(htmlOutputPath);
  } else {
    return res.json({ ok: false, message: "File not exists!." });
  }
});

//@route -> /api/document/dashboard
//@type -> POST
//@desc -> Create the R Dashboard file
documentRouter.post("/dashboard", async (req, res) => {
  try {
    const author = req.body.userId || req.session.user.userId;
    const trabajadoresPath = `${__basedir}/files/users/${author}/documents/planilla.xlsx`;
    const ponderacionesPath = `${__basedir}/files/users/${author}/documents/ponderacion.xlsx`;
    const factoresPath = `${__basedir}/files/placeholders/factores.xlsx`;

    if (!fs.pathExistsSync(trabajadoresPath)) {
      return res
        .status(200)
        .json({ ok: false, message: "Por favor suba la planilla." });
    }

    if (!fs.pathExistsSync(ponderacionesPath)) {
      return res.status(200).json({
        ok: false,
        message: "Se requiere las ponderaciones de la planilla.",
      });
    }

    if (!fs.pathExistsSync(factoresPath)) {
      return res
        .status(200)
        .json({ ok: false, message: "No existen factores." });
    }

    const htmlOutputPath = `${__basedir}/files/users/${author}/documents/dashboard.html`;
    // let exitsHtml = await fs.pathExists(htmlOutputPath);
    // if (exitsHtml) {
    //   return res.json({ ok: true, message: "El archivo ya existe." });
    // }

    let profileImagePath = `${__basedir}/files/users/${author}/images/profile.png`;
    if (!fs.pathExistsSync(profileImagePath)) {
      profileImagePath = `${__basedir}/files/placeholders/logo.png`;
    }

    try {
      await createDashboardHtml(
        trabajadoresPath,
        ponderacionesPath,
        factoresPath,
        profileImagePath,
        htmlOutputPath
      );
    } catch (error) {
      if (error.includes("output")) {
        return res.json({ ok: true, message: "Archivo creado." });
      } else {
        return res.json({
          ok: false,
          message: error,
        });
      }
    }

    let exits = await fs.pathExists(htmlOutputPath);
    if (exits) {
      return res.json({ ok: true, message: "Archivo creado correctamente." });
    } else {
      return res.json({
        ok: false,
        message: "Ocurrio un error en el proceso.",
      });
    }
  } catch (error) {
    // Validacion - Esto se hizo porque cada vez que se ejecutaba el script de R
    // siempre "disparaba / raise" un error que hace que el programa capture
    // el error y se caiga, en este caso estamos diciendo que si el texto del error
    // contiene la palabra "output", que igualmente imprima que el archivo HTML se creo
    // correctamente
    if (error.includes("output")) {
      return res.json({ ok: true, message: "Archivo creado." });
    } else {
      return res.json({
        ok: false,
        message: "Error al crear el documento.",
        error,
      });
    }
  }
});

//@route -> /api/document/create
//@type -> POST
//@desc -> Create Documents
documentRouter.post("/create", async (req, res) => {
  try {
    const document = new DocumentClass(req);
    const response = await document.createDocuments();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document/documentspoliticas
//@type -> POST
//@desc -> Create Documents Politicas
documentRouter.post("/documentspoliticas", async (req, res) => {
  try {
    const document = new DocumentClass(req);
    const response = await document.createDocumentsPoliticas(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document/createpolitica
//@type -> POST
//@desc -> Post Descripcion Empresa
documentRouter.post("/createpolitica", async (req, res) => {
  try {
    const document = new DocumentClass(req);
    const response = await document.createPolitica(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/document/getpoliticas
//@type -> Get
//@desc -> Get Descripcion Empresa
documentRouter.get("/getpoliticas", async (req, res) => {
  try {
    const document = new DocumentClass(req);
    const response = await document.getPoliticas();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//**** RUTA PARA CALCULAR LOS PUNTAJES DE LOS CVS  @JONATHAN@*/
//@route -> /api/document/rate
//@type -> GET
//@desc -> Rate Cv's for every Job
documentRouter.get("/rate", async (req, res) => {
  try {
    const document = new DocumentClass(req);
    const response = await document.rateCv();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default documentRouter;
export { DocumentObj };
