import Planilla from "../../models/Planilla";
import UserInfo from "../../models/UserInfo";
import User from "../../models/User";
import Document from "../../models/Document";

export default class AdminClass {
  constructor(req) {
    this.req = req;
  }
}

AdminClass.prototype.getAllSustentos = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const planillas = await Planilla.find()
        .populate("sustentos")
        .sort({ createdAt: -1 });

      let result = {};

      for (var i in planillas) {
        let p = planillas[i];
        const info = await UserInfo.findOne({ author: p.author });
        const user = await User.findById(p.author);
        const nombre = info ? info.nombre : user.username;
        if (!result.hasOwnProperty(nombre)) {
          result[nombre] = p.sustentos;
        }
      }

      let data = [];
      for (var i in Object.keys(result)) {
        const index = Object.keys(result)[i];
        const res = result[index];
        if (res && res[0]) {
          const p = await Planilla.findById(res[0].planilla);
          if (p) {
            for (var j in res) {
              data.push({
                ...res[j]._doc,
                empresa: index,
                author: p.author,
              });
            }
          }
        }
      }

      return resolve({ ok: true, data });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

AdminClass.prototype.getAllDocuments = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await User.find();
      users = users.filter((e) => e.role === "User");

      let result = [];
      for (var i in users) {
        let user = users[i];
        let info = await UserInfo.findOne({
          author: user._id,
        });
        let nombre = info ? info.nombre : user.username;
        let documents = await Document.find({
          author: user._id,
        });
        for (var j in documents)
          result = [...result, { ...documents[j]._doc, empresa: nombre }];
      }

      return resolve({ ok: true, data: result });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
