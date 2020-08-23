import express from "express";
import config from "../../../config";
import SignaturitClient from "signaturit-sdk";
import Reporte from "../../../models/Reporte";
import User from "../../../models/User";
import fs from "fs-extra";

const reporteRouter = express.Router();

function ReporteObj(req, id = null) {
  const basePath = id
    ? __basedir + "/files/users/" + id + "/reportes/"
    : __basedir + "/files/users/" + req.session.user.userId + "/reportes/";
  const client = new SignaturitClient(
    config.signaturit,
    config.nodeEnv !== "development"
  );
  const CrearReporte = async (correo, nombre, codigo, signature) => {
    let documents = [];
    signature.documents.forEach((doc) => {
      documents.push({
        id: doc.id,
        estado: false,
        nombre: doc.file.name,
      });
    });
    let reporte = new Reporte({
      author: id ? id : req.session.user.userId,
      correo,
      nombre,
      codigo,
      id: signature.id,
      documents,
    });
    await Reporte.create(reporte);
  };
  const GetDocument = async (id, docId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const signed = await client.getSignature(id);
        let nombre;
        for (let i in signed.documents) {
          let doc = signed.documents[i];
          if (doc.id === docId) {
            nombre = doc.file.name;
          }
        }
        return resolve(nombre);
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.enviarReporte = (correos, nombres, codigos, document) => {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i in correos) {
          let user = null;
          if (id) {
            user = await User.findById(id);
          }
          let signature = await client.createSignature(
            document,
            {
              name: nombres[i],
              email: correos[i],
            },
            {
              cc: {
                name: user ? user.username : req.session.user.username,
                email: user ? user.email : req.session.user.email,
              },
            }
          );

          if (signature.message)
            return reject({
              ok: false,
              message: signature.message,
            });
          CrearReporte(correos[i], nombres[i], codigos[i], signature);
        }

        return resolve({ ok: true });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getReporte = () => {
    return new Promise(async (resolve, reject) => {
      try {
        var allSignatures = await client.getSignatures();
        allSignatures.forEach((s) => {
          s.documents.forEach(async (d) => {
            if (d.status === "completed") {
              await Reporte.updateOne(
                {
                  id: s.id,
                  "documents.id": d.id,
                },
                {
                  $set: {
                    "documents.$.estado": true,
                  },
                }
              );
            }
          });
        });
        const reporte = await Reporte.find({
          author: id ? id : req.session.user.userId,
        });
        return resolve({ ok: true, data: reporte });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.downloadReporte = (id, docId) => {
    return new Promise(async (resolve, reject) => {
      try {
        fs.ensureDirSync(basePath);
        const nombre = await GetDocument(id, docId);
        const signed = await client.downloadSignedDocument(id, docId);
        fs.writeFileSync(basePath + nombre, signed);
        return resolve({
          ok: true,
          data: basePath + nombre,
        });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
}

//@route -> /api/reporte
//@type -> GET
//@desc -> Get Signatures
//@query -> id:(UserId)?
reporteRouter.get("", async (req, res) => {
  try {
    const reporteObj = new ReporteObj(req, req.query.id);
    const response = await reporteObj.getReporte();

    res.json(response);
  } catch (err) {
    res.json({ ok: false, data: err.message });
  }
});

//@route -> /api/reporte
//@type -> POST
//@desc -> Send Documents
//@body -> { correos:[String], document:[String], nombres:[String], codigos:[String], id:(UserId)? }
reporteRouter.post("", async (req, res) => {
  try {
    const { correos, document, nombres, codigos, id } = req.body;
    const reporteObj = new ReporteObj(req, id);
    const enviarReporte = await reporteObj.enviarReporte(
      correos,
      nombres,
      codigos,
      document
    );

    if (enviarReporte.ok === false) {
      res.json(enviarReporte);
    } else {
      const response = await reporteObj.getReporte();
      res.json(response);
    }
  } catch (err) {
    res.json({ ok: false, data: err.message });
  }
});

//@route -> /api/reporte/(SignatureId)/(SignatureDocumentId)
//@type -> GET
//@desc -> Download Signed Document
//@query -> id:(UserId)?
reporteRouter.get("/:id/:docId", async (req, res) => {
  try {
    const { id, docId } = req.params;
    const reporteObj = new ReporteObj(req, req.query.id);
    const response = await reporteObj.downloadReporte(id, docId);
    res.sendFile(response.data);
  } catch (err) {
    res.json({ ok: false, data: err.message });
  }
});

export default reporteRouter;
