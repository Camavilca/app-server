import express from "express";
import User from "../../../models/User";
import UserInfo from "../../../models/UserInfo";
import Postulacion from "../../../models/Postulacion";
import UserSelectionInfo from "../../../models/UserSelectionInfo";
import HtmlDocx from "html-docx-js";
import HtmlDiff from "node-htmldiff";
import mammoth from "mammoth";
import fs from "fs-extra";
import Document from "../../../models/Document";
import Empleo from "../../../models/Empleo";
import Edited from "../../../models/Edited";
import Politicas from "../../../models/Politicas";
import PlanillaClass from "../../../controllers/v1/planilla";
import AdminClass from "../../../controllers/v1/admin";
import Test from "../../../models/Test";
import Archivo from "../../../models/Archivo";
import KeywordClass from "../../../controllers/v1/keywords";
import { encryptInfo, regularInfo } from "../../../util/helpers";
import {
  REGULAR,
  SEMICIEGA,
} from "../../../constant/selection/empresa/empleos/tipo-seleccion";
import { ACTIVO } from "../../../constant/selection/empresa/empleos/estados";
import Politica from "../../../models/Politicas";
import PuntajePuesto from "../../../models/PuntajePuestos";
import HistorialReporte from "../../../models/HistorialReporte";
import { lowerFirst } from "lodash";
import Cv from "../../../models/Cv";
import Puntaje from "../../../models/Puntaje";

const adminRouter = express.Router();

function Admin() {
  const HtmlToDocx = (str, path) => {
    return new Promise(async (resolve, reject) => {
      try {
        const blob = await HtmlDocx.asBlob(str);
        await fs.writeFile(path, blob);
        return resolve({ ok: true });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  const HtmlDifference = (oldHtml, newHtml) => {
    return new Promise(async (resolve, reject) => {
      try {
        const difference = HtmlDiff(oldHtml, newHtml);
        return resolve({ ok: true, data: difference });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  const DocxToHtml = (path) => {
    return new Promise(async (resolve, reject) => {
      try {
        const html = await mammoth.convertToHtml({ path });
        return resolve({ ok: true, data: html.value });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  const EditedDocuments = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const editedDocs = await Edited.find({ document: id }).sort({
          createdAt: -1,
        });
        if (editedDocs.length <= 0) return resolve({ ok: true, data: null });
        return resolve({ ok: true, data: editedDocs });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.approveEdited = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const editedDocs = await Edited.findById(id);
        if (!editedDocs)
          return reject({ ok: false, message: "No se encuentra la edicion" });

        const doc = await Document.findById(editedDocs.document);
        doc.estado = true;
        doc.notas = "";
        await doc.save();

        const htmlToDocx = HtmlToDocx(editedDocs.html, doc.route);
        if (htmlToDocx.ok === false) return reject(htmlToDocx);

        return resolve({ ok: true, data: doc });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getEditedDocuments = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const edited = await EditedDocuments(id);
        if (edited.data) return resolve(edited);

        const document = await Document.findById(id);
        const docxHtml = await DocxToHtml(document.route);
        if (docxHtml.ok === false) return reject(docxHtml);

        const politica = await Politica.findOne({
          author: document.author,
          tipo: document.type,
        });

        const newEdited = await Edited.create({
          document: document._id,
          type: document.type,
          html: docxHtml.data,
          diff: docxHtml.data,
          summary: "Documento",
          respuestas: politica.respuestas,
        });

        return resolve({ ok: true, data: [newEdited] });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.editDocument = (id, newHtml, summary) => {
    return new Promise(async (resolve, reject) => {
      try {
        const edited = await Edited.findById(id);
        const difference = await HtmlDifference(edited.html, newHtml);
        const newEdited = await Edited.create({
          document: edited.document,
          html: newHtml,
          diff: difference.data,
          summary,
        });
        return resolve({ ok: true, data: newEdited });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getUsers = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = [];
        const user = await User.find({ role: "User" })
          .populate({ path: "apps" })
          .sort({ createdAt: -1 });

        if (user.length <= 0)
          return reject({
            ok: false,
            message: "No se encontro ningun usuario",
          });

        for (var i in user) {
          const u = user[i];
          const userInfo = await UserInfo.findOne({ author: u._id });
          data.push({ ...u._doc, empresa: userInfo ? userInfo.nombre : "" });
        }

        return resolve({ ok: true, data });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getAllCandidatos = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let users = await User.find({ role: "SelectionUser" });
        let idsUsers = users.map((u) => u._id);
        let cvs = await Archivo.find({ author: { $in: idsUsers } });
        let infoUsers = await UserSelectionInfo.find({
          author: { $in: idsUsers },
        });
        let allUsuariosInfos = [];
        for (let k = 0; k < users.length; k++) {
          let {
            _id,
            apps,
            permissions,
            username,
            email,
            createdAt,
            updatedAt,
          } = users[k];
          let objInfo = infoUsers.find(
            (item) => JSON.stringify(item.author) === JSON.stringify(_id)
          );
          let objCv = cvs.find(
            (item) => JSON.stringify(item.author) === JSON.stringify(_id)
          );
          let newUser = {
            _id,
            apps,
            permissions,
            username,
            email,
            createdAt,
            updatedAt,
            dni: 12313123,
            informacion: Boolean(objInfo) ? objInfo : false,
            cv: Boolean(objCv) ? objCv : false,
          };
          allUsuariosInfos.push(newUser);
        }

        // let allInfoUser = await UserSelectionInfo.find().populate({
        //   path: "author",
        // });
        resolve({ ok: true, data: allUsuariosInfos });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getAllPruebasByCandidatos = (author) => {
    return new Promise(async (resolve, reject) => {
      try {
        let pruebas = await Test.find({ author: author });
        resolve({ ok: true, data: pruebas });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getEmpresas = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const empresas = await UserInfo.find();
        return resolve({ ok: true, data: empresas });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getEmpleosByEmpresa = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const empleos = await Empleo.find({
          author: id ? id : this.req.session.user.userId,
        });
        return resolve({ ok: true, data: empleos });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.createPuntajePuesto = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = null;

        const { puesto, author, puntajes } = formData;
        const puestoMongo = await PuntajePuesto.findOne({ puesto: puesto });

        if (puestoMongo === null)
          response = await PuntajePuesto.create({ puesto, author });
        else {
          if (typeof puntajes !== "undefined") {
            puestoMongo.puntajes = puntajes;
            response = await puestoMongo.save();
          } else {
            return reject({ ok: false, message: "Este puesto ya existe" });
          }
        }

        return resolve({ ok: true, data: response });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getPuntajePuesto = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const puestos = await PuntajePuesto.find();
        return resolve({ ok: true, data: puestos });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getHistorialReporte = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const historiales = await HistorialReporte.find().populate({
          path: "author",
        });
        return resolve({ ok: true, data: historiales });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getAllPostulacionesByEmpleo = (empleoId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const empleo = await Empleo.findOne({ _id: empleoId, estado: ACTIVO });
        const postulaciones = await Postulacion.find({
          empleo: empleoId,
        }).populate({ path: "empleo" });

        let authores = postulaciones.map((postulacion) => postulacion.author);

        let userSelectionInfos = await UserSelectionInfo.find({
          author: { $in: authores },
        })
          .populate({ path: "author" })
          .populate({ path: "estudios" });

        const cvs = await Cv.find({ author: { $in: authores } });

        let cvsIds = cvs.map((k) => k._id);
        const puntajes = await Puntaje.find({ cv: { $in: cvsIds } });

        let newPostulaciones = postulaciones.map((postulacion) => {
          let obj = postulacion;
          puntajes.forEach((puntaje) => {
            let newObj = postulacion.toObject();
            if (puntaje.puesto === postulacion.empleo.nombrePuesto) {
              obj = { ...newObj, puntaje: puntaje.puntaje };
            } else {
              obj = { ...newObj, puntaje: 0 };
            }
          });
          return obj;
        });

        let data = this.convertData(
          userSelectionInfos,
          empleo.tipoSelection,
          newPostulaciones
        );
        return resolve({ ok: true, data: data });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.convertData = (userSelectionInfos, tipoSelection, postulaciones) => {
    let data = [];
    if (tipoSelection === REGULAR) {
      for (let k = 0; k < userSelectionInfos.length; k++) {
        data.push(
          regularInfo(userSelectionInfos[k], postulaciones[k], tipoSelection)
        );
      }
    }
    if (tipoSelection === SEMICIEGA) {
      for (let k = 0; k < userSelectionInfos.length; k++) {
        data.push(
          encryptInfo(userSelectionInfos[k], postulaciones[k], tipoSelection)
        );
      }
    }
    return data;
  };
}

//@route-> /api/admin/sustentos
//@type-> GET
//@desc-> Get all Sustentos
adminRouter.get("/sustentos", async (req, res) => {
  try {
    const admin = new AdminClass(req);
    const response = await admin.getAllSustentos();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/documents
//@type-> GET
//@desc-> Get all Documents
adminRouter.get("/documents", async (req, res) => {
  try {
    const admin = new AdminClass(req);
    const response = await admin.getAllDocuments();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/candidatos
//@type-> GET
//@desc-> Get all Candidatos
adminRouter.get("/candidatos", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.getAllCandidatos();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/pruebasbycandidato
//@type-> GET
//@desc-> Get all Pruebas by Candidato
adminRouter.get("/pruebasbycandidato", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.getAllPruebasByCandidatos(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/postulacionesByEmpleo
//@type-> GET
//@desc-> Get all Pruebas by Candidato
//@query -> Id from empleo
adminRouter.get("/postulacionesByEmpleo", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.getAllPostulacionesByEmpleo(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/users
//@type-> GET
//@desc-> Get All Users
adminRouter.get("/users", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.getUsers();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/edit
//@type-> POST
//@desc-> Edit Document
//@body-> {id:String, html:String, summary:String}
adminRouter.post("/edit", async (req, res) => {
  try {
    const { id, html, summary } = req.body;
    const admin = new Admin(req);
    const response = await admin.editDocument(id, html, summary);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/edit/(DocumentId)
//@type-> GET
//@desc-> Get All Edited || Create Edited
adminRouter.get("/edit/:id", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.getEditedDocuments(req.params.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/politicatype
//@type-> POST
//@desc-> Get Politica
adminRouter.get("/politicatype", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.getPoliticaForType(req.params.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/(EditedId)
//@type-> POST
//@desc-> Approve Edited Document and Upload
adminRouter.post("/aprove/:id", async (req, res) => {
  try {
    const admin = new Admin(req);
    const response = await admin.approveEdited(req.params.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/ponderacion/(UserId)
//@type-> POST
//@desc-> Create Ponderacion Factores
adminRouter.post("/ponderacion", async (req, res) => {
  try {
    const planilla = new PlanillaClass(req);
    const response = await planilla.crearPonderacion(req.body.author);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

// //@route-> /api/admin/ponderacion/(UserId)
// //@type-> POST
// //@desc-> Create Ponderacion Factores
// adminRouter.post("/ponderacion/:id", async (req, res) => {
//   try {
//     const planilla = new PlanillaClass(req);
//     const response = await planilla.crearPonderacion(req.params.id);

//     res.json(response);
//   } catch (err) {
//     res.json({ ok: false, message: err.message });
//   }
// });

//@route-> /api/admin/ponderacion/(UserId)
//@type-> GET
//@desc-> Download Ponderacion Factores
adminRouter.get("/ponderacion", async (req, res) => {
  const { id } = req.query;
  const author = id || req.session.user.userId;
  const basePath = __basedir + "/files/users/";
  const pathFile = basePath + author + "/documents/ponderacion.xlsx";
  if (fs.pathExistsSync(pathFile)) res.download(pathFile);
  else res.json({ ok: false, message: "No existe archivo." });
});

//@route-> /api/admin/keywords
//@type-> GET
//@desc-> Get all keyword colections
adminRouter.get("/keywords", async (req, res) => {
  try {
    const kw = new KeywordClass(req);
    const response = await kw.getKeywords();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/keywords
//@type-> POST
//@desc-> Upload Keywords Excel to Db
//@file-> .xlsx
adminRouter.post("/keywords", async (req, res) => {
  try {
    const kw = new KeywordClass(req);
    const response = await kw.uploadKeywordXlsx();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/keywords
//@type-> PUT
//@desc-> Upload Keywords Excel to Db
//@body-> {id:(KeywordId), nivel: String, category:String, keywords:[[key,val]]}
adminRouter.put("/keywords", async (req, res) => {
  try {
    const kw = new KeywordClass(req);
    const response = await kw.updateKeywords(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/keywords
//@type-> DELETE
//@desc-> Upload Keywords Excel to Db
//@query-> id: (KeywordId)
adminRouter.delete("/keywords", async (req, res) => {
  try {
    const kw = new KeywordClass(req);
    const response = await kw.deleteKeyword(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/empresas
//@type-> GET
//@desc-> Get all empresas
adminRouter.get("/empresas", async (req, res) => {
  try {
    const kw = new Admin(req);
    const response = await kw.getEmpresas();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/empleos
//@type-> GET
//@desc-> Get all empleos by empresa
//@query -> id (empresa Id)
adminRouter.get("/empleos", async (req, res) => {
  try {
    const kw = new Admin(req);
    const response = await kw.getEmpleosByEmpresa(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/puntajepuesto
//@type-> POST
//@desc-> Create Puntaje Puesto
adminRouter.post("/puntajepuesto", async (req, res) => {
  try {
    const kw = new Admin(req);
    const response = await kw.createPuntajePuesto(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/puntajepuesto
//@type-> GET
//@desc-> All Puntaje Puesto for Author
adminRouter.get("/puntajepuesto", async (req, res) => {
  try {
    const kw = new Admin(req);
    const response = await kw.getPuntajePuesto();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route-> /api/admin/historialreporte
//@type-> GET
//@desc-> All Historial Reporte
adminRouter.get("/historialreporte", async (req, res) => {
  try {
    const kw = new Admin(req);
    const response = await kw.getHistorialReporte();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default adminRouter;
