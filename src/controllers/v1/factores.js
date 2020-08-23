import Factor from "../../models/Factor";
import factoresArray from "./factores.json";

export default class FactorClass {
  constructor(req) {
    this.req = req;
  }
}

FactorClass.prototype.createFactors = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      const factors = await Factor.find({
        author: this.req.session.user.userId,
      });
      if (!factors || factors.length < 1)
        for (var i in factoresArray) {
          await Factor.create({
            author: this.req.session.user.userId,
            ...factoresArray[i],
          });
        }

      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

FactorClass.prototype.getFactors = async function (id = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const factors = await Factor.find({
        author: id ? id : this.req.session.user.userId,
      }).sort("key");

      if (!factors || factors.length < 1)
        return reject({ ok: false, message: "Por favor suba su planilla" });

      return resolve({ ok: true, data: factors });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

FactorClass.prototype.createFactor = async function (obj) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, categoria, nombre, peso, no_niveles } = obj;
      const factor = await Factor.create({
        author: id,
        categoria,
        nombre,
        peso,
        no_niveles,
      });
      return resolve({ ok: true, data: factor });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

FactorClass.prototype.updateFactor = async function (obj) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, categoria, nombre, peso, no_niveles } = obj;
      let factor = await Factor.findById(id);

      if (categoria) factor.categoria = categoria;
      if (nombre) factor.nombre = nombre;
      if (peso) factor.peso = peso;
      if (no_niveles) factor.no_niveles = no_niveles;
      await factor.save();

      return resolve({ ok: true, data: factor });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

FactorClass.prototype.deleteFactor = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let factor = await Factor.findById(id);
      await factor.remove();

      return resolve({ ok: true, data: factor });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
