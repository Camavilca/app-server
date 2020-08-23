import express from "express";
import Empleo from "../../../models/Empleo";
import UserInfo from "../../../models/UserInfo";
import Archivo from "../../../models/Archivo";
import User from "../../../models/User";
import Postulacion from "../../../models/Postulacion";
import Puntaje from "../../../models/Puntaje";
import Cv from "../../../models/Cv";
import EmpleoFavorito from "../../../models/EmpleoFavorito";
import createReport from "docx-templates";
import fs from "fs-extra";
import moment from "moment";
import plotlyServer from "plotly";
import Test from "../../../models/Test";
import PlotlyService from "../../../services/v1/Plotly.Service";
import UserSelectionInfo from "../../../models/UserSelectionInfo";
import config from "../../../config";
import { getBuilImage, joinToText, dateToAge } from "../../../util/helpers";
import { ACTIVO } from "../../../constant/selection/empresa/empleos/estados";
import { REALIZADO } from "../../../constant/selection/postulante/test/estados";

const reclutamientoRouter = express.Router();

function builImage(tests, plotly, req) {
  return new Promise((resolve, reject) => {
    try {
      var imgOpts = {
        format: "jpeg",
        width: 1000,
        height: 600,
      };
      for (let i = 0; i < tests.length; i++) {
        let test = tests[i];
        let data = getBuilImage(test);
        plotly.getImage(data, imgOpts, async (err, imageStream) => {
          if (err)
            return reject({
              ok: false,
              message: "Ocurrio un error al crear el grafico",
            });

          const directory = `${__basedir}/files/users/${req.body.id}/grafica${i}.jpeg`;
          const fileStream = fs.createWriteStream(directory);

          await imageStream.pipe(fileStream);
          if (i === tests.length - 1)
            return setTimeout(() => resolve(true), 1000);
        });
      }
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
}
function builReport(reportObj, tests, req) {
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const path =
          __basedir + "/files/users/" + req.body.id + "/grafica" + i + ".jpeg";

        let style = true; /** true == normal --- false == tabla */
        if (test.detalle.length > 0 && test.interpretacion == "") style = false;

        reportObj.data.project.push({
          index: i,
          style: style,
          detalles: test.detalle,
          name: test.tipo ? test.tipo.toUpperCase() : "test",
          description: test.interpretacion
            ? test.interpretacion
            : "falta completar la interpretacion",
          image: {
            width: 8,
            height: 8,
            path: path,
          },
        });
      }
      return resolve(true);
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
}
function builOneImage(test, plotly, req) {
  return new Promise((resolve, reject) => {
    try {
      var imgOpts = {
        format: "jpeg",
        width: 800,
        height: 600,
      };
      let data = getBuilImage(test);

      plotly.getImage(data, imgOpts, async (err, imageStream) => {
        if (err)
          return reject({
            ok: false,
            message: "Ocurrio un error al crear el grafico",
          });

        const grafica = "/grafica" + joinToText(req.body.tipo);

        const directory =
          __basedir + "/files/users/" + req.body.id + `${grafica}.jpeg`;

        const fileStream = fs.createWriteStream(directory);

        await imageStream.pipe(fileStream);
        resolve(true);
      });
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
}
function builOneReport(reportObj, test, req) {
  return new Promise((resolve, reject) => {
    try {
      const grafica = "/grafica" + joinToText(req.body.tipo);

      const path =
        __basedir + "/files/users/" + req.body.id + `${grafica}.jpeg`;

      reportObj.data.project = {
        name: test.tipo.toUpperCase(),
        description: test.interpretacion,
        image: {
          width: 8,
          height: 8,
          path: path,
        },
      };

      return resolve(true);
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
}
function ReclutamientoObj(req) {
  const reporteName = "/Reporte" + joinToText(req.body.tipo);

  const plotly = plotlyServer({
    username: config.plotly.user,
    apiKey: config.plotly.key,
    host: "chart-studio.plotly.com",
  });
  // imagenes - reporte
  const ReporteTheme = __basedir + "/files/TestReport5.docx";
  const OneReporteTheme = __basedir + "/files/Test.docx";

  const userAuthor = req.query.id;
  const userSession = req.session.user.userId;

  const Reporte = userAuthor
    ? __basedir + "/files/users/" + userAuthor + "/Report.docx"
    : __basedir + "/files/users/" + userSession + "/Report.docx";

  const OneReporte =
    __basedir + "/files/users/" + req.body.id + `${reporteName}.docx`;

  const testFunc = (tests, reportObj) => {
    return new Promise(async (resolve, reject) => {
      try {
        await builImage(tests, plotly, req);
        await builReport(reportObj, tests, req);
        return resolve(true);
      } catch (err) {
        return reject(false);
      }
    });
  };

  const builOneTest = (test, reportObj) => {
    return new Promise(async (resolve, reject) => {
      try {
        await builOneImage(test, plotly, req);
        await builOneReport(reportObj, test, req);
        return resolve(true);
      } catch (err) {
        return reject(false);
      }
    });
  };
  this.getEmpleos = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;

        let postulaciones = await Postulacion.find({ author: author });
        if (postulaciones) postulaciones = postulaciones.map((p) => p.empleo);

        let favoritos = await EmpleoFavorito.find({ author: author });
        if (favoritos) favoritos = favoritos.map((e) => e.empleo);

        const empleos = await Empleo.find({
          _id: { $nin: [...postulaciones, ...favoritos] },
          estado: ACTIVO,
        })
          .sort({ createdAt: -1 })
          .populate({ path: "empresa" });

        return resolve({ ok: true, data: empleos });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.createEmpleo = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const info = await UserInfo.findOne({ author });
        if (info === null)
          return reject({
            ok: false,
            message: "Por favor complete su perfil",
          });
        const empleo = await Empleo.create({
          ...formData,
          author,
          estado: ACTIVO,
          empresa: info._id,
        });
        return resolve({ ok: true, data: empleo });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.updateEmpleo = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          id,
          nombre,
          ubicacion,
          tipo,
          estudios,
          salario,
          pruebas,
          descripcion,
        } = formData;

        const empleo = await Empleo.findOne({
          _id: id,
          author: req.session.user.userId,
        });

        if (!empleo)
          return reject({
            ok: false,
            message: "No se encontro el empleo o no tiene permisos.",
          });

        if (nombre) empleo.nombre = nombre;
        if (ubicacion) empleo.ubicacion = ubicacion;
        if (tipo) empleo.tipo = tipo;
        if (estudios) empleo.estudios = estudios;
        if (salario) empleo.salario = salario;
        if (pruebas) empleo.pruebas = pruebas;
        if (descripcion) empleo.descripcion = descripcion;
        await empleo.save();

        return resolve({
          ok: true,
          data: empleo,
        });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.deleteEmpleo = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const empleo = await Empleo.findOne({
          _id: id,
          author: req.session.user.userId,
        });
        await empleo.remove();
        return resolve({
          ok: true,
          data: empleo,
        });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.getEmpleoById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const empleo = await Empleo.findOne({ _id: id });
        return resolve({ ok: true, data: empleo });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.updateEstadoEmpleos = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const empleo = await Empleo.updateOne(
          { _id: formData.empleo, author: formData.author || author },
          { $set: { estado: formData.estado } }
        );
        return resolve({ ok: true, data: empleo });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.createReport = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({ _id: id });

        const { email, _id } = user;

        const userInfo = await UserSelectionInfo.findOne({ author: _id });

        let tests = await Test.find({ author: _id, estado: REALIZADO });

        tests = tests.sort((a, b) => a.orden - b.orden);

        if (tests.length === 0)
          return reject({
            ok: false,
            message: "El usuario no realizo ninguna test",
          });

        const foto = {
          width: 5,
          height: 5,
          path: __basedir + "/files/users/" + id + "/images/profile.png",
        };

        if (!fs.pathExistsSync(foto.path))
          foto.path = __basedir + "/files/profile/sinperfil.jpg";

        var postulante = {
          foto: foto,
          nombre: userInfo.nombre,
          paterno: userInfo.paterno,
          materno: userInfo.materno,
          celular: userInfo.telefono,
          departamento: userInfo.departamento,
          provincia: userInfo.provincia,
          distrito: userInfo.distrito,
          sexo: userInfo.sexo,
          correo: email,
          dni: userInfo.dni,
          edad: dateToAge(userInfo.fecha_nacimiento),
        };

        let reportPath = `${__basedir}/files/users/${id}/Report.docx`;
        let reportObj = {
          template: ReporteTheme,
          output: reportPath,
          data: { project: [], postulante: postulante },
        };

        await testFunc(tests, reportObj);
        await createReport(reportObj);
        return resolve({ ok: true, message: "Reporte Satisfactorio" });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.createOneReport = (formdata) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({ _id: formdata.id });
        const userInfo = await UserSelectionInfo.findOne({ author: user._id });

        let test = await Test.findOne({
          author: user._id,
          tipo: formdata.tipo,
          estado: REALIZADO,
        });

        const foto = {
          width: 2,
          height: 2,
          path:
            __basedir + "/files/users/" + formdata.id + "/images/profile.png",
        };

        if (!fs.pathExistsSync(foto.path))
          foto.path = __basedir + "/files/profile/sinperfil.jpg";

        var postulante = {
          foto: foto,
          nombre: userInfo.nombre,
          celular: userInfo.telefono,
          correo: user.email,
          dni: userInfo.dni,
        };

        let reportObj = {
          template: OneReporteTheme,
          output: OneReporte,
          data: { project: {}, postulante: postulante },
        };

        await builOneTest(test, reportObj);
        await createReport(reportObj);
        return resolve({ ok: true, message: "Reporte Satisfactorio" });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.createPostulacion = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { empleo, author } = formData;

        let postulaciones = await Postulacion.find({ author: author });

        let existEmpleo = postulaciones.filter((e) => e.empleo == empleo);

        if (postulaciones.length > 0 && existEmpleo.length > 0)
          return reject({
            ok: false,
            message: "Usted ya postulo a este empleo",
          });

        const postulacion = await Postulacion.create({ ...formData });

        return resolve({ ok: true, data: postulacion.empleo });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.getPostulacion = () => {
    // se utiliza para el puntaje... No Tocar pls
    // Esta funcion solo lo debe utilizar el perfil postulante
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const postulaciones = await Postulacion.find({
          author: author,
        }).populate({
          path: "empleo",
          populate: { path: "empresa" },
        });

        const archivo = await Archivo.findOne({
          author: author,
          tipo: "CURRICULUM",
        });

        if (!archivo) throw new Error("Por favor suba su CV.");

        const cv = await Cv.findOne({ author: author });
        if (!cv) throw new Error("Error inesperado.");

        const puntajes = await Puntaje.find({ cv: cv._id });

        let newPostulaciones = postulaciones.map((postulacion) => {
          let obj = postulacion;
          puntajes.forEach((puntaje) => {
            if (puntaje.puesto === postulacion.empleo.nombrePuesto) {
              let newObj = postulacion.toObject();
              obj = { ...newObj, puntaje: puntaje.puntaje };
            }
          });
          return obj;
        });
        return resolve({ ok: true, data: newPostulaciones });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.getPostulacionAll = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const postulaciones = await Postulacion.find()
          .populate({
            path: "empleo",
            populate: { path: "empresa" },
          })
          .populate({ path: "author" });
        return resolve({ ok: true, data: postulaciones });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.getPostulacionById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const postulacion = await Postulacion.findOne({ _id: id })
          .populate({
            path: "empleo",
            populate: { path: "empresa" },
          })
          .populate({ path: "author" });
        return resolve({ ok: true, data: postulacion });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.getPostulacionByEmpleo = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { author, empleo } = formData;
        const postulacion = await Postulacion.findOne({
          author: author,
          empleo: empleo,
        });
        return resolve({ ok: true, data: postulacion });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.addEmpleoFavorito = (idEmpleo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const empleoDB = await Empleo.findOne({ _id: idEmpleo });
        if (empleoDB === null)
          return reject({ ok: false, message: "Empleo no existe" });
        await EmpleoFavorito.create({
          author: author,
          empleo: empleoDB,
          estado: "FAVORITO",
        });
        return resolve({ ok: true, data: empleoDB });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.removeEmpleoFavorito = (idEmpleo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const empleoDB = await Empleo.findOne({ _id: idEmpleo });
        if (empleoDB === null)
          return reject({ ok: false, message: "Empleo no existe" });
        await EmpleoFavorito.remove({ author: author, empleo: empleoDB });
        return resolve({ ok: true, data: empleoDB });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.getEmpleosFavoritos = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const favoritos = await EmpleoFavorito.find({
          author: author,
        }).populate({
          path: "empleo",
          populate: { path: "empresa" },
        });
        let empleos = favoritos.map((f) => f.empleo);
        return resolve({ ok: true, data: empleos });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
  this.deletePostulacion = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const postulacion = await Postulacion.findOne({
          _id: id,
          author: req.session.user.userId,
        });
        await postulacion.remove();
        return resolve({ ok: true, data: postulacion });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };
}

//@route -> /api/reclutamiento
//@type -> GET
//@desc -> Get Empleos
reclutamientoRouter.get("", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getEmpleos();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento
//@type -> POST
//@desc -> Create Empleo
//@body -> {author(userId), nombre:String, ubicacion:String, tipo:String, estudios:String, salario:Int, pruebas:[String], descripcion:String}
reclutamientoRouter.post("", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.createEmpleo(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento
//@type -> PUT
//@desc -> Update Empleo
//@body -> {author(userId), nombre:String, ubicacion:String, tipo:String, estudios:String, salario:Int, pruebas:[String], descripcion:String}
reclutamientoRouter.put("", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.updateEmpleo(req.body);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento
//@type -> DELETE
//@desc -> Delete Empleo
//@query -> (EmpleoId)
reclutamientoRouter.delete("", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.deleteEmpleo(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/empleoById
//@type -> GET
//@desc -> Get Empleo
//@query -> (EmpleoId)
reclutamientoRouter.get("/empleoById", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getEmpleoById(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/updateEstadoEmpleo
//@type -> PUT
//@desc -> Update Estado Empleo
reclutamientoRouter.put("/updateEstadoEmpleo", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.updateEstadoEmpleos(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/reporte
//@type -> POST
//@desc -> Create Test Report
reclutamientoRouter.post("/reporte", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.createReport(req.body.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/reporte
//@type -> GET
//@desc -> Download Test Report
reclutamientoRouter.get("/reporte", (req, res) => {
  const dir = __basedir + "/files/users/" + req.query.id + "/Report.docx";
  if (fs.pathExistsSync(dir)) res.download(dir);
});

//@route -> /api/reclutamiento/reporte
//@type -> GET
//@desc -> Download Test Report
reclutamientoRouter.get("/reporte-test-by-employment", (req, res) => {
  const dir = `${__basedir}/files/users/${req.query.author}/report-test/Reporte-Completo.docx`;
  if (fs.pathExistsSync(dir)) res.download(dir);
});

//@route -> /api/reclutamiento/reporte
//@type -> GET
//@desc -> Download Test Report PDF
reclutamientoRouter.get("/reporte-test-by-employment-pdf", (req, res) => {
  // console.log("src/api/routes/v1/reclutamiento.js linea 767");
  const dir = `${__basedir}/files/users/${req.query.author}/report-test/Reporte-Completo.pdf`;
  if (fs.pathExistsSync(dir)) res.download(dir);
});

//@route -> /api/reclutamiento/onereporte
//@type -> POST
//@desc -> Create Test Report
reclutamientoRouter.post("/onereporte", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.createOneReport(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/onereporte
//@type -> GET
//@desc -> Download Test Report  -> depende de la prueba
reclutamientoRouter.get("/onereporte", (req, res) => {
  const reporteName = "/Reporte" + joinToText(req.query.tipo);
  const dir =
    __basedir + "/files/users/" + req.query.id + `${reporteName}.docx`;
  if (fs.pathExistsSync(dir)) res.download(dir);
});

//@route -> /api/reclutamiento/postulacion
//@type -> POST
//@desc -> Create Postulacion
reclutamientoRouter.post("/postulacion", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.createPostulacion(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/postulacion
//@type -> GET
//@desc -> Get Postulacion
reclutamientoRouter.get("/postulacion", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getPostulacion();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/all
//@type -> GET
//@desc -> Get Postulacion
reclutamientoRouter.get("/postulacion/all", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getPostulacionAll();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/all
//@type -> GET
//@desc -> Get Postulacion
reclutamientoRouter.get("/postulacion/:id", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getPostulacionById(req.params.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/postulacion
//@type -> DELETE
//@desc -> Delete Postulacion
reclutamientoRouter.delete("/postulacion", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.deletePostulacion(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/postulacionbyempleo
//@type -> GET
//@desc -> Get Postulacion By Empleo
reclutamientoRouter.get("/postulacionbyempleo", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getPostulacionByEmpleo(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/addempleofavorito
//@type -> POST
//@desc -> Añadir empleo favorito
reclutamientoRouter.post("/addempleofavorito", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.addEmpleoFavorito(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/removeempleofavorito
//@type -> POST
//@desc -> Remove empleo favorito
reclutamientoRouter.post("/removeempleofavorito", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.removeEmpleoFavorito(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/empleosfavoritos
//@type -> GET
//@desc -> All empleos favoritos por usuario
reclutamientoRouter.get("/empleosfavoritos", async (req, res) => {
  try {
    const reclutamientoObj = new ReclutamientoObj(req);
    const response = await reclutamientoObj.getEmpleosFavoritos();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/reclutamiento/plotly
reclutamientoRouter.get("/plotly", async (req, res) => {
  try {
    const author = "5e9e8628e413ba6b88c48af0";
    const plotly = new PlotlyService(req, author);
    plotly.TEST_BAP6();
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default reclutamientoRouter;
