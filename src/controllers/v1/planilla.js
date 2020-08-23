import Planilla from "../../models/Planilla";
import Worker from "../../models/Worker";
import Banda from "../../models/Banda";
import BandaPorSexo from "../../models/BandaPorSexo";
import Sustento from "../../models/Sustento";
import Factor from "../../models/Factor";
import Excel from "exceljs";
import csv from "csvtojson";
import fs from "fs-extra";
import _ from "lodash";
import Ponderacion from "../../models/Ponderacion";
import { CRITERIA } from "../../constant/selection/postulante/test/calculo";
import runScriptR from "../../util/runScriptR";
var XLSX = require("xlsx");

export default class PlanillaClass {
  constructor(req) {
    this.planillaRoute = req.params.id
      ? __basedir + "/files/users/" + req.params.id + "/documents/"
      : __basedir + "/files/users/" + req.session.user.userId + "/documents/";
    this.req = req;
    fs.ensureDirSync(this.planillaRoute);

    this.files = `${__basedir}/files`;
    this.planillaPath = `${this.planillaRoute}planilla.xlsx`;
    this.ponderacionPath = `${this.planillaRoute}ponderacion.xlsx`;
    this.factoresPath = `${this.files}/placeholders/factores.xlsx`;
  }
}

PlanillaClass.prototype.saveFileToPonderacionCollection = function () {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(this.planillaRoute + "ponderacion.xlsx");
      const sheet_name_list = workbook.SheetNames;
      let json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
        header: [
          "puestos",
          "gradoInstruccion",
          "experienciaLaboral",
          "habilidadesCognitivas",
          "habilidadesInterdiciplinarias",
          "habilidadesComunicativas",
          "mental",
          "fisico",
          "manejoDelPersonal",
          "manejoInformacion",
          "manejoRecursosEconomicos",
          "ejercicioFunciones",
          "riesgo",
          "total",
        ],
      });
      // Se le quita el primer obj porque son los headers
      json.shift();
      resolve(json);
    } catch (err) {
      return { ok: false, message: err.message };
    }
  });
};

PlanillaClass.prototype.calculateMedian = function (arr) {
  var half = Math.floor(arr.length / 2);
  arr.sort(function (a, b) {
    return a - b;
  });
  if (arr.length % 2) {
    return arr[half];
  } else {
    return (arr[half - 1] + arr[half]) / 2.0;
  }
};

PlanillaClass.prototype.excedente = function (banda, compensacion) {
  const min = Math.round(
    ((banda.minSueldo - compensacion) / banda.minSueldo) * 100
  );
  const max = Math.round(
    ((banda.maxSueldo - compensacion) / banda.maxSueldo) * 100
  );
  return { min, max };
};

PlanillaClass.prototype.getPlanilla = function (search, match = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const planilla = await Planilla.find(search)
        .sort({ createdAt: -1 })
        .populate({ path: "workers", match })
        .populate({ path: "sustentos", match });

      return planilla.length > 0
        ? resolve({ ok: true, data: planilla })
        : reject({ ok: false, message: "No se encontro la planilla" });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.checkPlanillaFormat = function (worksheet) {
  if (
    worksheet.getCell("A1").value.toLowerCase() !== "codigo" ||
    worksheet.getCell("T1").value.toLowerCase() !== "otros beneficios"
  )
    return {
      ok: false,
      message: "Asegurese que esta usando el formato correcto",
    };
};

PlanillaClass.prototype.excelToDB = function (titles) {
  return new Promise(async (resolve, reject) => {
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(this.planillaRoute + "planilla.xlsx");
      const worksheet = workbook.getWorksheet(1);

      const checkFormat = this.checkPlanillaFormat(worksheet);
      if (checkFormat) return reject(checkFormat);

      worksheet.spliceRows(1, 1, titles);

      worksheet.eachRow((row, rowNumber) => {
        let arr = ["J", "K", "L"];
        if (rowNumber > 1) {
          for (var i in arr) {
            let letter = arr[i];
            row.getCell(letter).value = new Date(row.getCell(letter).value);
          }
        }
      });

      await workbook.csv.writeFile(this.planillaRoute + "planilla.csv");
      const workersArr = await csv().fromFile(
        this.planillaRoute + "planilla.csv"
      );
      const workers = await Worker.insertMany(workersArr);
      const planilla = await Planilla.create({
        author: this.req.session.user.userId,
        workers,
      });
      workers.forEach((w) => {
        w.planilla = planilla._id;
        w.save();
      });

      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.crearPonderacion = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let puestos = [],
        nomFactores = [];
      const factores = await Factor.find({ author: id });
      const planillas = await this.getPlanilla({ author: id });
      const workers = planillas.data[0].workers;
      for (var i in workers) puestos.push(workers[i].puesto);
      for (var i in factores) nomFactores.push(factores[i].nombre);
      puestos = puestos.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet("Factores");
      sheet.getColumn(1).values = ["Puestos", ...puestos];
      sheet.getRow(1).values = ["Puestos", ...nomFactores, "Total"];
      sheet.autoFilter = "A1";
      for (let i = 1; i <= sheet.columnCount; i++)
        sheet.getColumn(i).width = 30;
      const planillaPath = __basedir + "/files/users/" + id + "/documents/";
      await workbook.xlsx.writeFile(planillaPath + "ponderacion.xlsx");
      return resolve({ ok: true });
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
};

PlanillaClass.prototype.createPuntos = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const factores = await Factor.find({ author: id });
      const planillas = await this.getPlanilla({ author: id });
      const workers = await Worker.find({
        planilla: planillas.data[0]._id,
      });
      let razonPuntos = [];

      for (var i in factores)
        razonPuntos.push({
          razon: 9 / (factores[i].no_niveles - 1),
          peso: factores[i].peso,
        });

      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(this.planillaRoute + "ponderacion.xlsx");
      const worksheet = workbook.getWorksheet(1);

      let count = 1;
      worksheet.eachRow(async function (row, rowNumber) {
        if (rowNumber > 1) {
          let val = [],
            finalPoints;
          for (var i = 2; i < razonPuntos.length + 2; i++) {
            val.push(
              (1 + (row.getCell(i).value - 1) * razonPuntos[i - 2].razon) *
                razonPuntos[i - 2].peso
            );
          }
          finalPoints = val.reduce((a, b) => a + b);

          let filteredWorkers = workers.filter(
            (w) => w.puesto === row.getCell(1).value
          );

          for (var i in filteredWorkers) {
            let worker = filteredWorkers[i];
            worker.puntos = Math.round(finalPoints);
            await worker.save();
          }

          count++;
          if (count === worksheet.rowCount) return resolve({ ok: true });
        }
      });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.saveToPonderacion = function (id, arrPonderaciones) {
  return new Promise(async (resolve, reject) => {
    try {
      const ponderaciones = arrPonderaciones.map((e) => ({ ...e, author: id }));
      const result = await Ponderacion.create(ponderaciones);
      resolve(result);
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.createBandas = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const foundBandas = await Banda.find({ author: id });
      if (foundBandas && foundBandas.length > 0)
        for (var i in foundBandas) {
          await foundBandas[i].remove();
        }

      let banda = {};
      const bandasPuntos = {
        banda1: [200, 300],
        banda2: [301, 400],
        banda3: [401, 550],
        banda4: [551, 700],
        banda5: [701, 850],
        banda6: [851, 1000],
      };
      const planillas = await this.getPlanilla({ author: id });
      const workers = await Worker.find({
        planilla: planillas.data[0]._id,
      }).sort("puntos");

      for (var i in workers) {
        let worker = workers[i];
        let puntos = worker.puntos;
        let sueldo = Math.round(worker.sueldoBruto);

        for (var j in bandasPuntos) {
          if (puntos >= bandasPuntos[j][0] && puntos <= bandasPuntos[j][1]) {
            banda[j] = banda[j] ? [...banda[j], sueldo] : [sueldo];
          }
        }
      }

      for (var i in banda) {
        let minPuntos, maxPuntos;
        const median = this.calculateMedian(banda[i]);
        const minSueldo = Math.round(median * (1 - CRITERIA));
        const maxSueldo = Math.round(median * (1 + CRITERIA));
        for (var j in bandasPuntos) {
          if (j === i) {
            minPuntos = bandasPuntos[j][0];
            maxPuntos = bandasPuntos[j][1];
          }
        }
        await Banda.create({
          author: id,
          minPuntos,
          maxPuntos,
          minSueldo,
          maxSueldo,
          nombre: i,
          mediana: median,
        });
      }

      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.createBandasPorSexo = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const foundBandasPorSexo = await BandaPorSexo.find({ author: id });

      if (foundBandasPorSexo && foundBandasPorSexo.length > 0) {
        for (const i in foundBandasPorSexo) {
          await foundBandasPorSexo[i].remove();
        }
      }

      const bandasPuntos = [
        [200, 300],
        [301, 400],
        [401, 550],
        [551, 700],
        [701, 850],
        [851, 1000],
      ];

      const planillas = await this.getPlanilla({ author: id });

      const workers = await Worker.find({
        planilla: planillas.data[0]._id,
      }).sort("puntos");

      const male = "M";
      const female = "F";

      const maleWorkers = workers.filter((w) => w.genero === male);
      const femaleWorkers = workers.filter((w) => w.genero === female);

      const maleWorkersByBands = [];
      const femaleWorkersByBands = [];

      for (let i = 0; i < bandasPuntos.length; i++) {
        let maleRange = [];
        for (let j = 0; j < maleWorkers.length; j++) {
          if (
            bandasPuntos[i][0] <= maleWorkers[j].puntos &&
            bandasPuntos[i][1] >= maleWorkers[j].puntos
          ) {
            maleRange.push(maleWorkers[j]);
          }
        }
        maleWorkersByBands.push(maleRange);
        maleRange = [];

        let femaleRange = [];
        for (let j = 0; j < femaleWorkers.length; j++) {
          if (
            bandasPuntos[i][0] <= femaleWorkers[j].puntos &&
            bandasPuntos[i][1] >= femaleWorkers[j].puntos
          ) {
            femaleRange.push(femaleWorkers[j]);
          }
        }
        femaleWorkersByBands.push(femaleRange);
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
        return Math.round(result);
      }

      let promisesMale = [];

      // Empieza R
      let out = await runScriptR(
        {
          planillaPath: this.planillaPath,
          ponderacionPath: this.ponderacionPath,
          factoresPath: this.factoresPath,
        },
        `${__basedir}/R/generatePValue.R`
      );
      console.log("out", out);

      let indexMaleWorkers = 0;

      maleWorkersByBands.forEach((workers, index) => {
        let salaries = workers.map((w) => w.sueldoBruto);
        let medianSalary = getMediana(salaries);
        const range = Math.round(CRITERIA * medianSalary);
        const maxLimite = medianSalary + range;
        const minLimite = medianSalary - range;
        const minPuntos = bandasPuntos[index][0];
        const maxPuntos = bandasPuntos[index][1];

        //temporal
        let femaleWorkers = femaleWorkersByBands[index];
        let femaleSalaries = femaleWorkers.map((w) => w.sueldoBruto);
        let femaleLength = femaleSalaries.length;
        // fin temporal

        if (salaries.length > 0 || femaleLength > 0) {
          const pvalor = out[indexMaleWorkers];
          const promise = BandaPorSexo.create({
            author: id,
            minPuntos,
            maxPuntos,
            minLimite,
            maxLimite,
            nombre: `banda${index + 1}`,
            mediana: medianSalary || 0,
            bandaGenero: male,
            pvalor,
          });
          promisesMale.push(promise);
          indexMaleWorkers++;
        }
      });

      await Promise.all(promisesMale);

      let promisesFemale = [];

      let indexFemaleWorkers = 0;
      femaleWorkersByBands.forEach((banda, index) => {
        let salary = banda.map((w) => w.sueldoBruto);
        let medianSalary = getMediana(salary);
        const range = Math.round(CRITERIA * medianSalary);
        const maxLimite = medianSalary + range;
        const minLimite = medianSalary - range;
        const minPuntos = bandasPuntos[index][0];
        const maxPuntos = bandasPuntos[index][1];

        //temporal
        let maleWorkers = maleWorkersByBands[index];
        let maleSalaries = maleWorkers.map((w) => w.sueldoBruto);
        let maleLength = maleSalaries.length;
        // fin temporal

        if (salary.length > 0 || maleLength > 0) {
          const pvalor = out[indexFemaleWorkers];
          let promise = BandaPorSexo.create({
            author: id,
            minPuntos,
            maxPuntos,
            minLimite,
            maxLimite,
            nombre: `banda${index + 1}`,
            mediana: medianSalary || 0,
            bandaGenero: female,
            pvalor,
          });
          promisesFemale.push(promise);
          indexFemaleWorkers++;
        }
      });

      await Promise.all(promisesFemale);

      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.deleteFromSustentos = function (arr) {
  return new Promise(async (resolve, reject) => {
    try {
      arr.forEach(async (e) => {
        let s = await Sustento.findById(e._id);
        let p = await Planilla.findById(s.planilla);
        p.sustentos = p.sustentos.filter((sustento) => sustento !== s._id);
        await p.save();
        await s.remove();
      });
      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.createSustentos = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let sustento = [];
      let planilla = await this.getPlanilla({ author: id });
      planilla = planilla.data;
      const bandas = await Banda.find({ author: id }).sort({ minPuntos: 1 });
      planilla[0].workers.forEach((worker) => {
        const compensacion = Math.round(worker.sueldoBruto);
        const banda = bandas.filter((banda) => {
          if (
            worker.puntos >= banda.minPuntos &&
            worker.puntos <= banda.maxPuntos
          )
            return banda;
        })[0];
        if (
          banda &&
          (banda.minSueldo > compensacion || banda.maxSueldo < compensacion)
        ) {
          const excedente = this.excedente(banda, compensacion);
          const isAbove = banda.maxSueldo < compensacion;
          sustento.push({
            codigo: worker.codigo,
            nombre: worker.nombre || worker.numDoc || "Sin Nombre",
            cargo: worker.puesto,
            puntos: worker.puntos,
            genero: worker.genero,
            banda: banda.nombre,
            minExcedente: excedente.min,
            maxExcedente: excedente.max,
            compensacion,
            isAbove,
            planilla: planilla[0]._id,
          });
        }
      });

      /*** RENZO */
      sustento = sustento.filter((s) =>
        s.isAbove ? Math.abs(s.maxExcedente) > 0 : Math.abs(s.minExcedente) > 0
      );

      const filt = (x, y) => x.codigo.toLowerCase() === y.codigo.toLowerCase();

      if (planilla[0].sustentos.length > 0) {
        let toDelete = _.differenceWith(planilla[0].sustentos, sustento, filt);
        let toAdd = _.differenceWith(sustento, planilla[0].sustentos, filt);

        if (toDelete.length > 0) await this.deleteFromSustentos(toDelete);
        if (toAdd.length > 0) {
          const sustentos = await Sustento.insertMany(toAdd);
          sustentos.forEach((x) => planilla[0].sustentos.push(x));
          planilla[0].save();
        }
      } else {
        const sustentos = await Sustento.insertMany(sustento);
        planilla[0].sustentos = sustentos;
        planilla[0].save();
      }

      return resolve({ ok: true, data: planilla[0] });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PlanillaClass.prototype.updateSustento = function (data) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, sustento, estado, categoria } = data;

      for (var i in id) {
        const _id = id[i];
        const oldSustento = await Sustento.findById(_id);
        if (!oldSustento)
          return reject({
            ok: false,
            message: "No se encuentra el Sustento",
          });

        if (sustento) {
          await oldSustento.updateOne({
            $set: {
              oldSustento: [...oldSustento.oldSustento, oldSustento.sustento],
              sustento,
              categoria: [...categoria],
            },
          });
        } else if (estado)
          await oldSustento.updateOne({
            $set: {
              estado,
            },
          });
      }

      if (id.length > 1) {
        const foundSustento = await Sustento.findById(id[0]);
        const planilla = await Planilla.findById(
          foundSustento.planilla
        ).populate({
          path: "sustentos",
        });
        if (!planilla)
          return reject({
            ok: false,
            message: "No se encuentra la Planilla",
          });

        return resolve({ ok: true, data: planilla.sustentos });
      } else {
        const foundSustento = await Sustento.findById(id[0]);
        return resolve({ ok: true, data: foundSustento });
      }
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
