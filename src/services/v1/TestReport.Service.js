import PlotlyService from "./Plotly.Service";
import createReport from "docx-templates";
import UserSelectionInfo from "../../models/UserSelectionInfo";
import User from "../../models/User";
import Test from "../../models/Test";
import {
  NAME_BAP6,
  NAME_BAP7,
  NAME_CAMBIOS,
  NAME_DARTAGNAN,
  NAME_DONATELLO,
  NAME_INTELIGENCIA,
  NAME_LIDERAZGOGOLEN,
  NAME_MOSS,
  NAME_SOCIAL,
  NAME_EMPRENDIMIENTO,
  NAME_ASERTIVIDAD,
} from "../../constant/selection/postulante/test/names";

export default class TestReportService {
  constructor(req, author) {
    this.req = req;
    this.nameOneReport = `/Reporte-${req.body.tipo}.docx`;
    this.author =
      author || req.params.userId || req.session.user.userId || req.query.id;
    this.fileRoute = __basedir + "/files/";
    this.authorRoute = __basedir + "/files/users/" + this.author;
    this.imgTestRoute = this.authorRoute + "/tests";
    this.inputCompletReport = __basedir + "/files/Reporte.docx";
    this.inputOneReport = __basedir + "/files/Test.docx";
    this.outputCompletReport = this.authorRoute + "/Report.docx";
    this.outputOneReport = this.authorRoute + this.nameOneReport;
    this.zeroTest = "Candidato aun no rindio nungun test";
  }
}

TestReportService.prototype.findTest = function (tests, tipo) {
  const response = tests.filter((t) => t.tipo === tipo);
  return response[0];
};

TestReportService.prototype.existsImgsTests = async function () {
  const BAP6 = await fs.exists(this.imgTestRoute + "/IMG_BAP6.jpeg");
  const BAP7 = await fs.exists(this.imgTestRoute + "/IMG_BAP7.jpeg");
  const CAMBIOS = await fs.exists(this.imgTestRoute + "/IMG_CAMBIOS.jpeg");
  const DARTAGN = await fs.exists(this.imgTestRoute + "/IMG_DARTAGNAN.jpeg");
  const DONATEL = await fs.exists(this.imgTestRoute + "/IMG_DONATELLO.jpeg");
  const INTELIG = await fs.exists(this.imgTestRoute + "/IMG_INTELIGENCIA.jpeg");
  const LIDER = await fs.exists(this.imgTestRoute + "/IMG_LIDERAZGOGOLEN.jpeg");
  const MOSS = await fs.exists(this.imgTestRoute + "/IMG_MOSS.jpeg");
  const SOCIAL = await fs.exists(this.imgTestRoute + "/IMG_SOCIAL.jpeg");
  const EMPRE = await fs.exists(this.imgTestRoute + "/IMG_EMPRENDIMIENTO.jpeg");
  const ASERTIV = await fs.exists(this.imgTestRoute + "/IMG_ASERTIVIDAD.jpeg");
};

TestReportService.prototype.createReport = function (author) {
  return new Promise(async (resolve, reject) => {
    try {
      const usuario = await User.findOne({ _id: author });
      if (usuario === null)
        return reject({ ok: false, message: "El usuario no existe" });

      const tests = await Test.find({ author: author || this.author });
      if (tests === null)
        return reject({ ok: false, message: "Candidato no tiene pruebas" });

      const plotlyService = new PlotlyService(this.req, author);
      const jsonBAP6 = this.findTest(tests, NAME_BAP6);
      const jsonBAP7 = this.findTest(tests, NAME_BAP7);
      const jsonCambios = this.findTest(tests, NAME_CAMBIOS);
      const jsonDartagnan = this.findTest(tests, NAME_DARTAGNAN);
      const jsonDonatello = this.findTest(tests, NAME_DONATELLO);
      const jsonInteligencia = this.findTest(tests, NAME_INTELIGENCIA);
      const jsonLiderazgo = this.findTest(tests, NAME_LIDERAZGOGOLEN);
      const jsonMoss = this.findTest(tests, NAME_MOSS);
      const jsonSocial = this.findTest(tests, NAME_SOCIAL);
      const jsonEmpren = this.findTest(tests, NAME_EMPRENDIMIENTO);
      const jsonAsertiv = this.findTest(tests, NAME_ASERTIVIDAD);

      let BAP6 = null;
      let BAP7 = null;
      let CAMBIOS = null;
      let DARTAGNAN = null;
      let DONATELLO = null;
      let INTELIGEN = null;
      let LIDERAZGO = null;
      let MOSS = null;
      let SOCIAL = null;
      let EMPRENDIMI = null;
      let ASERTIVIDAD = null;

      BAP6 = await plotlyService.TEST_BAP6(jsonBAP6);
      BAP7 = await plotlyService.TEST_BAP7(jsonBAP7);
      CAMBIOS = await plotlyService.TEST_CAMBIOS(jsonCambios);
      DARTAGNAN = await plotlyService.TEST_DARTAGNAN(jsonDartagnan);
      DONATELLO = await plotlyService.TEST_DONATELLO(jsonDonatello);
      INTELIGEN = await plotlyService.TEST_INTELIGENCIA(jsonInteligencia);
      LIDERAZGO = await plotlyService.TEST_LIDERAZGOGOLEN(jsonLiderazgo);
      MOSS = await plotlyService.TEST_MOSS(jsonMoss);
      SOCIAL = await plotlyService.TEST_SOCIAL(jsonSocial);
      EMPRENDIMI = await plotlyService.TEST_EMPRENDIMIENTO(jsonEmpren);
      ASERTIVIDAD = await plotlyService.TEST_ASERTIVIDAD(jsonAsertiv);

      const OBAP6 = { ...jsonBAP6, path: BAP6 };
      const OBAP7 = { ...jsonBAP7, path: BAP7 };
      const OCAMBIOS = { ...jsonCambios, path: CAMBIOS };
      const ODARTAGNAN = { ...jsonDartagnan, path: DARTAGNAN };
      const ODONATELLO = { ...jsonDonatello, path: DONATELLO };
      const OINTELIGEN = { ...jsonInteligencia, path: INTELIGEN };
      const OLIDERAZ = { ...jsonLiderazgo, path: LIDERAZGO };
      const OMOSS = { ...jsonMoss, path: MOSS };
      const OSOCIAL = { ...jsonSocial, path: SOCIAL };
      const OEMPRENDIMI = { ...jsonEmpren, path: EMPRENDIMI };
      const OSERTIVIDAD = { ...jsonAsertiv, path: ASERTIVIDAD };

      const postulante = await this.builPostulante(usuario);

      let reportObj = {
        template: this.inputCompletReport,
        output: this.outputCompletReport,
        data: {
          project: [],
          postulante: postulante,
          // ODONATELLO /** Personalidad */,
          // ODARTAGNAN /**Inteligencia III */,
          // OSOCIAL /**Habilidades Sociales */,
          // OLIDERAZ /**Liderazgo */,
          // OMOSS /**Adaptabilidad para gerentes */,
          // OINTELIGEN /**Inteligencia I */,
          // OBAP7 /**Razonamiento Logico */,
          // OBAP6 /**Razonamiento Numérico */,
          // OCAMBIOS /**Adaptabilidad */,
          // OEMPRENDIMI /**Aptitud emprendedora */,
          // OSERTIVIDAD /**Comunicacion efectiva */,
        },
      };

      // await this.builReport(reportObj);
      resolve({ ok: true, message: "Reporte Satisfactorio" });
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
};

TestReportService.prototype.builPostulante = async function (usuario) {
  const { nombre, telefono, dni } = await UserSelectionInfo.findOne({
    author: author,
  });
  const fotoPerfil = {
    width: 2,
    height: 2,
    path: this.authorRoute + "/images/profile.png",
  };
  return {
    foto: fotoPerfil,
    nombre: nombre,
    celular: telefono,
    correo: usuario.email,
    dni: dni,
  };
};

TestReportService.prototype.builReport = async function (reportObj) {
  await createReport(reportObj);
};
