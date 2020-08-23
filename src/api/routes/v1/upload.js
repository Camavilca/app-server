import express from "express";
import UploadClass from "../../../controllers/v1/upload";
import DocumentsClass from "../../../controllers/v1/documents";
import PlanillaClass from "../../../controllers/v1/planilla";
import FactorClass from "../../../controllers/v1/factores";
import BandaClass from "../../../controllers/v1/bandas";
import fs from "fs-extra";
import HelperClass from "../../../controllers/v1/helper";
import Post from "../../../models/Post";
import Cv from "../../../models/Cv";
import { zip } from "zip-a-folder";
import path from "path";
import { PDF, DOCX, DOC } from "../../../constant/typefiles";
import ArchivoService from "../../../services/v1/Archivo.Service";
import libre from "libreoffice-convert";
import R from "r-script";
import RService from "../../../services/v1/R.Service";

const uploadRouter = express.Router();

//@route -> /api/upload
//@type -> POST
//@desc -> Upload Documents
//@body -> File: docx
uploadRouter.post("", async (req, res) => {
  try {
    const upload = new UploadClass(req);
    const response = await upload.uploadFile([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ]);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/upload/planilla
//@type -> POST
//@desc -> Upload Planilla && Create Factors
//@body -> File: xlsx
uploadRouter.post("/planilla", async (req, res) => {
  try {
    const titles = [
      "codigo",
      "tipoDoc",
      "numDoc",
      "genero",
      "nombre",
      "correo",
      "puesto",
      "sede",
      "nivel",
      "nacimiento",
      "ingreso",
      "ascenso",
      "cargoAnterior",
      "sueldo2016",
      "sueldo2017",
      "sueldo2018",
      "sueldoBruto",
      "sueldoNeto",
      "comision",
      "otros",
    ];
    const name = "planilla";
    const upload = new UploadClass(req);
    const planilla = new PlanillaClass(req);
    const factor = new FactorClass(req);
    let message;

    await upload.uploadFile(
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream",
      ],
      name + ".xlsx"
    );

    await planilla.excelToDB(titles);
    await factor.createFactors();

    const checkSize = await HelperClass.checkCompanySize(
      req,
      req.session.user.userId
    );

    if (checkSize.ok) {
      message = "Se actualizo su plan de equality";
      req.session.user = checkSize.user;
      await Post.create({
        user: req.session.user.userId,
        title:
          "Se cambio su plan de equality, dado a que la cantidad de trabajadores no corresponde con el plan",
        body: "Cambio de plan equality",
        link: "/user",
      });
    }

    const planillas = await planilla.getPlanilla({
      author: req.session.user.userId,
    });
    const factors = await factor.getFactors();

    res.json({
      ok: true,
      data: {
        factores: factors.data,
        planilla: planillas.data[0],
        user: checkSize.ok && checkSize.user,
        message: message && message,
      },
    });
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/upload/organigrama
//@type -> POST
//@desc -> Create Reporte
//@body -> File: jpg/jpeg
uploadRouter.post("/organigrama", async (req, res) => {
  try {
    const upload = new UploadClass(req, "images");
    const response = await upload.uploadFile(
      ["image/jpeg", "image/pjpeg"],
      "organigrama.jpg"
    );

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/upload
//@type -> GET
//@desc -> Get Organigrama
//@query -> id(UserId)
uploadRouter.get("", async (req, res) => {
  const directory =
    __basedir + "/files/users/" + req.query.id + "/images/organigrama.jpg";
  if (fs.pathExistsSync(directory) && directory) res.sendFile(directory);
});

//@route -> /api/upload/existorganigrama
//@type -> GET
uploadRouter.get("/existorganigrama", async (req, res) => {
  const directory =
    __basedir +
    "/files/users/" +
    req.session.user.userId +
    "/images/organigrama.jpg";
  if (fs.pathExistsSync(directory)) res.json({ ok: true });
  else res.json({ ok: false });
});

//@route -> /api/upload/ponderacion/(UserId)
//@type -> POST
//@desc -> Upload Ponderacion
//@body -> File: xlsx
uploadRouter.post("/ponderacion/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const upload = new UploadClass(req);
    const planilla = new PlanillaClass(req);
    const banda = new BandaClass(req);

    await upload.uploadFile(
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream",
      ],
      "ponderacion.xlsx"
    );

    await planilla.createPuntos(id);
    await planilla.createBandas(id);
    await planilla.createBandasPorSexo(id);

    // guardar a la base de datos las ponderacion de esa empresa
    let ponderaciones = await planilla.saveFileToPonderacionCollection();

    const ponderacionesResult = await planilla.saveToPonderacion(
      id,
      ponderaciones
    );
    const planillaResponse = await planilla.createSustentos(id);
    const bandas = await banda.getBandas(id);

    res.json({
      ok: true,
      data: { planilla: planillaResponse.data, bandas: bandas.data },
    });
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/upload/profile
//@type -> POST
//@desc -> Upload Profile Image
//@body -> File: png || jpg
uploadRouter.post("/profile", async (req, res) => {
  try {
    const upload = new UploadClass(req, "images");
    const response = await upload.uploadFile(
      ["image/png", "image/jpeg", "image/pjpeg"],
      "profile.png"
    );
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/upload/profile
//@type -> GET
//@desc -> get Profile Image
//@query -> (UserId)
uploadRouter.get("/profile", async (req, res) => {
  const userId = req.query.id || req.session.user.id;
  const photo = __basedir + "/files/users/" + userId + "/images/profile.png";
  const sinPhoto = __basedir + "/files/profile/sinperfil.jpg";
  if (fs.pathExistsSync(photo)) res.sendFile(photo);
  else res.sendFile(sinPhoto);
});

//@route -> /api/upload/incognito
//@type -> GET
//@desc -> get profile image oculta
//@query -> Defect
uploadRouter.get("/incognito", async (req, res) => {
  const directory = __basedir + "/files/profile/anonimo.jpg";
  if (fs.pathExistsSync(directory)) res.sendFile(directory);
});

//@route -> /api/upload/curriculumvitae
//@type -> POST
//@desc -> Upload Curriculum Vitae
//@body -> File: docx

const convertToPdf = (file, outputPath) => {
  return new Promise((resolve, reject) => {
    libre.convert(file, ".pdf", undefined, (err, done) => {
      if (err) {
        reject(`Error converting file: ${err}`);
      }
      fs.writeFileSync(outputPath, done);
      resolve(outputPath);
    });
  });
};

uploadRouter.post("/curriculumvitae", async (req, res) => {
  try {
    const userId =
      req.session && req.session.user ? req.session.user.userId : null;

    if (!userId) {
      res.json({
        ok: false,
        message: "Inicie sesión nuevamente, por favor",
      });
    }

    const upload = new UploadClass(req, "cv");
    const archivo = new ArchivoService(req);
    const response = await upload.uploadFile([PDF, DOCX, DOC], "cv", true);
    const { data } = await archivo.createArchivo({
      tipo: "CURRICULUM",
      nombre: response.data,
      estado: "ACTIVO",
    });

    let pdfPath = data.ruta.split(".")[0] + ".pdf";

    if (data && !data.nombre.includes("pdf")) {
      let file = fs.readFileSync(data.ruta);
      let outputPath = await convertToPdf(file, pdfPath);
    }
    let cvJson = await RService.extractTextFromCV(pdfPath);

    if (!cvJson) {
      return res.json({
        ok: false,
        message: "Formato no leible",
      });
    }

    let cv = await Cv.findOne({
      author: userId,
    });

    if (cv) {
      cv = await Cv.findByIdAndUpdate(cv._id, {
        author: userId,
        id: cvJson.id,
        nombre: cvJson.nombre,
        correo: cvJson.correo,
        telefono: cvJson.telefono,
        grado: cvJson.grado,
        universidad: cvJson.universidad,
        words: cvJson.words,
        goodwords: `${cvJson.palabras_buenas || 0}`,
      });
    } else {
      cv = await Cv.create({
        author: userId,
        id: cvJson.id,
        nombre: cvJson.nombre,
        correo: cvJson.correo,
        telefono: cvJson.telefono,
        grado: cvJson.grado,
        universidad: cvJson.universidad,
        words: cvJson.words,
      });
    }

    const documentService = new DocumentsClass(req);
    await documentService.rateOneCv(cv._id);

    return res.json(response);
  } catch (err) {
    return res.json({
      ok: false,
      message:
        message ||
        "El formato no se pudo leer correctamente. Contacte con HCP, por favor.",
    });
  }
});

//@route -> /api/upload/curriculum
//@type -> GET
//@desc -> get Profile Image
//@query -> (UserId)
uploadRouter.get("/curriculum", async (req, res) => {
  const userId = req.query.id || req.session.user.id;
  const pathCv = __basedir + "/files/users/" + userId + "/cv/cv.pdf";
  if (fs.pathExistsSync(pathCv)) res.sendFile(pathCv);
});

//@route -> /api/upload/downloadFile
//@type -> GET
//@desc -> Descarga de Archivos
uploadRouter.get("/downloadFile", async (req, res) => {
  const classArchivo = new ArchivoService(req);
  const { tipo, author } = req.query;
  const { data } = await classArchivo.findFile({ tipo, author });
  if (fs.pathExistsSync(data.ruta)) res.download(data.ruta);
});

//@route -> /api/upload/existFile
//@type -> GET
//@desc -> Existencia de Archivos
uploadRouter.get("/existFile", async (req, res) => {
  const classArchivo = new ArchivoService(req);
  const response = await classArchivo.findFile({ tipo: "CURRICULUM" });
  if (response.data === null) return res.json({ ok: true, data: null });
  const { data } = response;
  if (fs.pathExistsSync(data.ruta)) res.json({ ok: true, data: data });
});

//@route -> /api/upload/existProfile
//@type -> GET
//@desc -> get Profile Image
//@query -> (UserId)
uploadRouter.get("/existProfile", async (req, res) => {
  const directory = req.query.id
    ? __basedir + "/files/users/" + req.query.id + "/images/profile.png"
    : req.session.user.userId
    ? __basedir +
      "/files/users/" +
      req.session.user.userId +
      "/images/profile.png"
    : null;
  if (fs.pathExistsSync(directory)) res.json({ ok: true, data: true });
  else res.json({ ok: true, data: false });
});

//@route -> /api/upload/documentspoliticas
//@type -> POST
//@desc -> Upload Documento Politica
//@body -> File: docx
uploadRouter.post("/documentspoliticas", async (req, res) => {
  try {
    const upload = new UploadClass(req, "documents");
    const response = await upload.uploadFile([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ]);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

/** ZIP DE DOCUMENTOS */
//@route -> /api/upload/getcvs
//@type -> GET
//@desc -> Get All Cv's
uploadRouter.get("/getcvs", async (req, res) => {
  try {
    const dir = __basedir + "/files/doc_themes";
    const zipDir = path.dirname(__basedir) + "/test.zip";
    await zip(dir, zipDir);

    res.sendFile(path.dirname(__basedir) + "/test.zip");
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default uploadRouter;
