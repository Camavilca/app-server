import { IncomingForm } from "formidable";
import fs from "fs-extra";
import Edited from "../../models/Edited";
import Document from "../../models/Document";
import User from "../../models/User";
import { DOC, DOCX, PDF } from "./../../constant/typefiles";

export default class UploadClass {
  constructor(req, folder = "documents") {
    this.basePath = req.params.id
      ? __basedir + "/files/users/" + req.params.id + "/" + folder + "/"
      : __basedir +
        "/files/users/" +
        req.session.user.userId +
        "/" +
        folder +
        "/";
    this.req = req;
    this.folder = folder;
  }
}

UploadClass.prototype.checkType = function (type, file) {
  let fileType = "permitidos";
  if (!type.includes(file.type))
    return {
      ok: false,
      message: `Por favor solo suba archivos ${fileType}`,
    };
};

UploadClass.prototype.DocToDB = async function (file) {
  try {
    const { path, name } = file;
    const doc = await Document.findOne({
      nombre: name,
      author: this.req.session.user.userId,
    });

    doc
      ? await doc.updateOne({
          $set: {
            nombre: name,
            route: path,
            estado: false,
            notas: "",
          },
        })
      : await Document.create({
          nombre: name,
          route: path,
          author: this.req.session.user.userId,
        });

    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};

UploadClass.prototype.deleteEdited = function (nombre) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Document.findOne({
        author: this.req.session.user.userId,
        nombre,
      });
      if (!doc) return resolve({ ok: true });

      const q = { document: doc._id };
      const edited = await Edited.find(q);
      if (edited.length > 0) await Edited.deleteMany(q);

      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

UploadClass.prototype.uploadFile = function (type, name = null, isTypes) {
  return new Promise((resolve, reject) => {
    try {
      fs.ensureDirSync(this.basePath);
      const form = new IncomingForm();

      form
        .on("fileBegin", async (field, file) => {
          let isDocType = this.checkType(type, file);
          if (isDocType) return reject(isDocType);

          if (isTypes) {
            const tipoArchivo = file.type;
            if (tipoArchivo === DOC) name = name + ".doc";
            if (tipoArchivo === DOCX) name = name + ".docx";
            if (tipoArchivo === PDF) name = name + ".pdf";
          }
          name !== null && (file.name = name);
          file.path = this.basePath + file.name;

          if (
            this.folder === "documents" &&
            type.includes(
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
          ) {
            await this.DocToDB(file);
            await this.deleteEdited(file.name);
          }
        })
        .on("end", () => {
          return resolve({ ok: true, data: name });
        });

      form.parse(this.req);
    } catch (err) {
      return { ok: false, message: err.message };
    }
  });
};
