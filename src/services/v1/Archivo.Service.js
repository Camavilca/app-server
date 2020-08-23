import Archivo from "../../models/Archivo";

export default class ArchivoService {
  constructor(req) {
    this.req = req;
    this.author = req.params.userId || req.session.user.userId || req.query.id;
    this.fileRoute = __basedir + "/files/";
    this.authorRoute = __basedir + "/files/users/" + this.author;
    this.cv = this.authorRoute + "/cv/";
  }
}

/**
 * @param {Object} file
 * @description objeto file tiene que contener todos los campos
 * @param {string} author -
 * @param {string} tipo -
 * @param {string} estado -
 * @param {string} ruta -
 * @param {string} nombre -
 */
ArchivoService.prototype.createArchivo = function (file) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file)
        reject({ ok: false, message: "Tienes que cargar un documento" });

      await Archivo.deleteOne({ author: this.author });
      const archivo = await Archivo.create({
        author: file.author || this.author,
        tipo: file.tipo || "ARCHIVO",
        nombre: file.nombre || "ARCHIVO",
        estado: file.estado || "ACTIVO",
        ruta: this.cv + file.nombre,
      });

      resolve({ ok: true, data: archivo });
    } catch (err) {
      reject({ ok: false, message: err.message });
    }
  });
};

/**
 * @param {string} author -
 * @description author campo opcional
 */
ArchivoService.prototype.allArchivos = async function (author) {
  return new Promise(async (resolve, reject) => {
    try {
      let archivos = null;
      if (author) archivos = await Archivo.find({ author: author });
      else archivos = await Archivo.find();
      resolve({ ok: true, data: archivos });
    } catch (err) {
      reject({ ok: false, message: err.message });
    }
  });
};

/**
 * @param {string} author -
 * @description author campo opcional
 */
ArchivoService.prototype.findFile = async function (objeto) {
  return new Promise(async (resolve, reject) => {
    try {
      const archivo = await Archivo.findOne({
        author: objeto.author || this.author,
        tipo: objeto.tipo,
      });
      resolve({ ok: true, data: archivo });
    } catch (err) {
      reject({ ok: false, message: err.message });
    }
  });
};

/**
 * @param {Object} usuario
 * @description objeto en donde puede contener author o id de archivo
 * @param {object} id -
 * @param {string} author -
 */
ArchivoService.prototype.deleteArchivo = async function (objeto) {
  return new Promise(async (resolve, reject) => {
    try {
      let archivo = null;
      if (author) archivo = await Archivo.deleteOne({ author: objeto.author });
      if (id) archivo = await Archivo.deleteOne({ id: objeto.id });
      resolve({ ok: true, data: archivo });
    } catch (err) {
      reject({ ok: false, message: err.message });
    }
  });
};
