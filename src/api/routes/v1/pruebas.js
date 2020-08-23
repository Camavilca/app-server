import express from "express";
import Test from "../../../models/Test";
import ExperienciaCliente from "../../../models/ExperienciaCliente";
import TestComplet from "../../../models/TestComplet";
import UserSelectionInfo from "../../../models/UserSelectionInfo";
import ReportController from "../../../controllers/v1/Report.Controller";
import { dateToAge } from "../../../util/helpers";
import { isAuth } from "../../../api/middlewares";
import {
  ELIMINADO,
  REALIZADO,
} from "../../../constant/selection/postulante/test/estados";

const pruebasRouter = express.Router();

function PruebasObj(req) {
  this.getTests = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const tests = await Test.find({ author: req.session.user.userId });
        // estado: REALIZADO,

        if (tests.length < 1)
          return resolve({
            ok: false,
            message: "Por favor complete las pruebas",
          });

        return resolve({ ok: true, data: tests });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.addTest = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const {
          puntaje,
          porcentaje,
          interpretacion = "",
          tipo,
          nivel,
          detalle = [],
          orden = 0,
          estado,
        } = formData;

        const testComplet = await Test.findOne({
          author: author,
          tipo: tipo,
        });

        if (testComplet && testComplet.estado === REALIZADO)
          return reject({ ok: false, message: "Ya realizo la Prueba" });

        const test = await Test.create({
          author: author,
          puntaje,
          porcentaje,
          interpretacion,
          tipo,
          nivel,
          detalle,
          orden,
          estado,
        });

        return resolve({ ok: true, data: test });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.addTestComplet = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let author = req.session.user.userId;

        const userselection = await UserSelectionInfo.findOne({
          author: author,
        });

        await TestComplet.create({
          ...formData,
          sexo: userselection.sexo,
          edad: dateToAge(userselection.fecha_nacimiento).toString(),
          author: author,
        });

        return resolve({ ok: true });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.deleteTest = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const test = await Test.findOne({ _id: id });
        await Test.deleteOne({ _id: id });
        return resolve({ ok: true, data: test });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.changeState = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, state } = formData;
        const test = await Test.findOne({ _id: id });
        test.estado = state;
        await test.save();
        return resolve({ ok: true, data: test });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.createExperienciaCliente = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cliente = await ExperienciaCliente.create({
          author: req.session.user.userId,
          ...formData,
        });
        return resolve({ ok: true, data: cliente });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getExperienciaCliente = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const cliente = await ExperienciaCliente.findOne({ author: author });
        return resolve({ ok: true, data: cliente });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
}

//@route -> /api/pruebas/unlockCompleteReport
//@type -> POST
//@desc -> send emails to recommended people
pruebasRouter.post(
  "/unlockCompleteReport",
  ReportController.unlockCompleteReport
);

//@route -> /api/pruebas
//@type -> GET
//@desc -> get Tests
pruebasRouter.get("", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    const response = await pruebasObj.getTests();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pruebas
//@type -> POST
//@desc -> Add Test to DB
//@body -> { puntaje:Number, porcentaje:Number, interpretacion:String, tipo:String, nivel:String }
pruebasRouter.post("", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    const response = await pruebasObj.addTest(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pruebas/detalle
//@type -> POST
//@desc -> Add Test Complet to DB
pruebasRouter.post("/detalle", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    await pruebasObj.addTestComplet(req.body);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pruebas/nps
//@type -> POST
//@desc -> Add Test to DB
pruebasRouter.post("/nps", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    const response = await pruebasObj.createExperienciaCliente(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pruebas/nps
//@type -> GET
//@desc -> Add Test to DB
pruebasRouter.get("/nps", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    const response = await pruebasObj.getExperienciaCliente();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pruebas
//@type -> DELETE
//@desc -> Delete Test from User
pruebasRouter.delete("", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    const response = await pruebasObj.deleteTest(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pruebas/updatestate
//@type -> GET
//@desc -> Change State Test { estado: ELIMINADO }
pruebasRouter.post("/updatestate", async (req, res) => {
  try {
    const pruebasObj = new PruebasObj(req);
    const response = await pruebasObj.changeState(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default pruebasRouter;
