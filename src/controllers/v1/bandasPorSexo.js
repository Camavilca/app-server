import BandaPorSexo from "../../models/BandaPorSexo";

export default class BandaPorSexoClass {
  constructor(req) {
    this.req = req;
  }
}

BandaPorSexoClass.prototype.getBandasPorSexo = function (id = null) {
  return new Promise(async (resolve, reject) => {
    try {
      var bandaPorSexo = await BandaPorSexo.find({
        author: id ? id : this.req.session.user.userId,
      }).sort({ minPuntos: 1 });
      return resolve({ ok: true, data: bandaPorSexo });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
