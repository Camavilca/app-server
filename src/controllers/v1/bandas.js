import Banda from "../../models/Banda";

export default class BandaClass {
  constructor(req) {
    this.req = req;
  }
}

BandaClass.prototype.getBandas = function (id = null) {
  return new Promise(async (resolve, reject) => {
    try {
      var banda = await Banda.find({
        author: id ? id : this.req.session.user.userId,
      }).sort({ minPuntos: 1 });
      return resolve({ ok: true, data: banda });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

BandaClass.prototype.createBanda = function (obj) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, minPuntos, maxPuntos, mediana, cambio, nombre } = obj;

      var banda = await Banda.create({
        author: id,
        minPuntos,
        maxPuntos,
        nombre,
        minSueldo: mediana * (1 - cambio / 100),
        maxSueldo: mediana * (1 + cambio / 100),
      });

      return resolve({ ok: true, data: banda });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

BandaClass.prototype.deleteBanda = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      var banda = await Banda.findById(id);
      await banda.remove();

      return resolve({ ok: true, data: banda });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

BandaClass.prototype.updateBanda = function (data) {
  return new Promise(async (resolve, reject) => {
    try {
      const { minPuntos, maxPuntos, minSueldo, maxSueldo, nombre, id } = data;
      let banda = await Banda.findById(id);

      if (!banda)
        return reject({ ok: false, message: "No se encontro la banda" });

      minPuntos && (banda.minPuntos = minPuntos);
      maxPuntos && (banda.maxPuntos = maxPuntos);
      minSueldo && (banda.minSueldo = minSueldo);
      maxSueldo && (banda.maxSueldo = maxSueldo);
      nombre && (banda.nombre = nombre);
      await banda.save();

      return resolve({
        ok: true,
        data: banda,
      });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
