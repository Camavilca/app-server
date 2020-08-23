import EmploymentService from "../../../services/v2/employment";
import PostulationService from "../../../services/v2/postulation";
import UserInfoService from "../../../services/v2/user-info";
import TestService from "../../../services/v2/test";
import CvService from "../../../services/v2/cv";
import PuntajeService from "../../../services/v2/puntaje";
import { ACTIVO } from "../../../constant/selection/empresa/empleos/estados";
import { REGULAR } from "../../../constant/selection/empresa/empleos/tipo-seleccion";
import { SEMICIEGA } from "../../../constant/selection/empresa/empleos/tipo-seleccion";
import { regularInfo, encryptInfo } from "../../../util/helpers";
import {
  CANTIDATE_UPLOADED_CV,
  CANTIDATE_COMPLETED_TEST,
  CANTIDATE_COMPLETED_PRE_INTERVIEW,
  CANTIDATE_REFERENCES_SENT,
  CANTIDATE_CLIENT_INTERVIEW_DONE,
  CANTIDATE_CLOSED_PROCESS,
} from "../../../constant/selection/empresa/empleos/my-postulation";
import {
  getStageCvs,
  getStageTests,
  getStagePreInterview,
  getPostulationsDefault,
  getStageReference,
  getStateFinalists,
  getStateHired,
} from "./get-stage";

function PostulationController() {
  return Object.freeze({
    find,
    getPostulationsByJob2,
    addScoreInterview,
    addScoreReference,
    getPostulationsByJob,
    countStagePostulationsByJob,
    getAllPostulationsByJob,
    getCandidateCompletedTest,
    changeStatePostulation,
  });
}
export default PostulationController();

// no cambiar
async function getAllPostulationsByJob(req, res, next) {
  try {
    const { userId = null } = req.session.user;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");

    let employmentId = req.query.employmentId;
    let postulations = await PostulationService.findSimple({
      empleo: employmentId,
    });

    let employment = await EmploymentService.findOne({ _id: employmentId });

    let postulationsAuthorIds = postulations.map(
      (postulation) => postulation.author
    );

    let userSelectionsInfos = await UserInfoService.findUserSelectionInfoPopulate(
      {
        author: { $in: postulationsAuthorIds },
      }
    );

    let cvs = await CvService.find({ author: { $in: postulationsAuthorIds } });
    let cvsIds = cvs.map((cv) => cv._id);
    let scores = await PuntajeService.find({
      keyword: employment.dictionary,
      cv: { $in: cvsIds },
    });

    let data = [];
    if (employment.tipoSelection === REGULAR) {
      userSelectionsInfos.map((item) => {
        let author = item.author._id;
        let objPostulation = postulations.find(
          (postulation) =>
            JSON.stringify(postulation.author) === JSON.stringify(author)
        );
        let cv = cvs.find(
          (cv) => JSON.stringify(cv.author) === JSON.stringify(author)
        );
        let score = scores.find(
          (score) => JSON.stringify(score.cv) === JSON.stringify(cv._id)
        );

        let resultScore = 0;

        if (typeof score === "undefined") resultScore = 0;
        else {
          if (score.puntaje - Math.floor(score.puntaje) === 0) {
            resultScore = score.puntaje * 100;
          } else {
            resultScore = (score.puntaje * 100).toFixed(2);
          }
        }

        // numero % 1 == 0 => NUMERO ENTERO

        data.push(
          regularInfo(
            item,
            objPostulation,
            employment.tipoSelection,
            resultScore
          )
        );
      });
    }
    if (employment.tipoSelection === SEMICIEGA) {
      userSelectionsInfos.map((item) => {
        let author = item.author._id;
        let objPostulation = postulations.find(
          (postulation) =>
            JSON.stringify(postulation.author) === JSON.stringify(author)
        );
        let cv = cvs.find(
          (cv) => JSON.stringify(cv.author) === JSON.stringify(author)
        );
        let score = scores.find(
          (score) => JSON.stringify(score.cv) === JSON.stringify(cv._id)
        );

        let resultScore = 0;

        if (typeof score === "undefined") resultScore = 0;
        else resultScore = (score.puntaje * 100).toFixed(2);

        data.push(
          encryptInfo(
            item,
            objPostulation,
            employment.tipoSelection,
            resultScore
          )
        );
      });
    }

    return res.json({ ok: true, data: data });
  } catch (error) {
    next(error);
  }
}

async function find(req, res, next) {
  try {
    const { userId = null } = req.session.user;
    if (!userId) {
      throw new Error("Por favor inicie sesión nuevamente");
    }
    const cvId = req.body.cvId;
    let postulations = await PostulationService.find({
      author: userId,
      cvId,
    });
    return res.json({
      ok: true,
      data: postulations,
    });
  } catch (error) {
    next(error);
  }
}

async function getPostulationsByJob2(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");

    let idJob = req.query.id;
    let employment = await EmploymentService.findOne({
      _id: idJob,
      estado: ACTIVO,
    });
    if (!employment) throw new Error("El Empleo no existe");

    let data = {};

    data.allPostulationsDefault = await getPostulationsDefault(employment);
    // console.log("done getPostulationsDefault");

    data.allPostulationsStateCV = await getStageCvs(employment);
    // console.log("done getStageCvs");

    data.allPostulationsStateTest = await getStageTests(employment);
    // console.log("done getStageTests");

    data.allPostulationsStatePreInterview = await getStagePreInterview(
      employment
    );
    // console.log("done getStagePreInterview");

    data.allPostulationsStateRefence = await getStageReference(employment);
    // console.log("done getStageReference");

    data.allPostulationsStateFinalists = await getStateFinalists(employment);
    // console.log("done getStateFinalists");

    data.allPostulationsStateHired = await getStateHired(employment);
    // console.log("done getStateHired");

    return res.json({ ok: true, data: data });
  } catch (error) {
    next(error);
  }
}

async function countStagePostulationsByJob(req, res, next) {
  try {
    let idJob = req.query.id;
    let postulations = await PostulationService.find({ empleo: idJob });
    let candidateUploadedCv = postulations.filter(
      (item) => item.etapa === CANTIDATE_UPLOADED_CV
    ).length;
    let candidateCompletedTest = postulations.filter(
      (item) => item.etapa === CANTIDATE_COMPLETED_TEST
    ).length;
    let candidateCompletedPreInterview = postulations.filter(
      (item) => item.etapa === CANTIDATE_COMPLETED_PRE_INTERVIEW
    ).length;
    let candidateReferencesSent = postulations.filter(
      (item) => item.etapa === CANTIDATE_REFERENCES_SENT
    ).length;
    let candidateClientInterviewDone = postulations.filter(
      (item) => item.etapa === CANTIDATE_CLIENT_INTERVIEW_DONE
    ).length;
    let candidateClosedProcess = postulations.filter(
      (item) => item.etapa === CANTIDATE_CLOSED_PROCESS
    ).length;

    let data = {
      cvs: candidateUploadedCv,
      tests: candidateCompletedTest,
      entrevistas: candidateCompletedPreInterview,
      referencias: candidateReferencesSent,
      finalistas: candidateClientInterviewDone,
      contratados: candidateClosedProcess,
    };

    return res.json({ ok: true, data: data });
  } catch (error) {
    next(error);
  }
}

async function getPostulationsByJob(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");

    let idJob = req.query.id;
    let stageJob = req.query.etapa;

    let empleo = await EmploymentService.findOne({
      _id: idJob,
      estado: ACTIVO,
    });
    if (!empleo) throw new Error("El Empleo no existe");

    let objPostulations = stageJob
      ? { empleo: empleo._id, etapa: stageJob }
      : { empleo: empleo._id };

    let postulations = await PostulationService.findPopulate(objPostulations);
    if (!postulations) return res.json({ ok: true, data: [] });

    let arrIdUsers = postulations.map((postulacion) => postulacion.author);

    // let cvs = await CvService.find({ author: { $in: arrIdUsers } });
    let userSelectionsInfos = await UserInfoService.findUserSelectionInfoPopulate(
      {
        author: { $in: arrIdUsers },
      }
    );

    postulations.forEach((postulation) => (postulation.puntaje = 0));

    let data = [];

    if (empleo.tipoSelection === REGULAR) {
      for (let k = 0; k < userSelectionsInfos.length; k++) {
        data.push(
          regularInfo(
            userSelectionsInfos[k],
            postulations[k],
            empleo.tipoSelection
          )
        );
      }
    }
    if (empleo.tipoSelection === SEMICIEGA) {
      for (let k = 0; k < userSelectionsInfos.length; k++) {
        data.push(
          encryptInfo(
            userSelectionsInfos[k],
            postulations[k],
            empleo.tipoSelection
          )
        );
      }
    }

    return res.json({ ok: true, data: data });
  } catch (error) {
    next(error);
  }
}

async function getCandidateCompletedTest(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");

    // Parametros enviados
    let idJob = req.query.id;
    let stageJob = req.query.etapa;

    // busqueda de empleo
    let empleo = await EmploymentService.findOne({
      _id: idJob,
      estado: ACTIVO,
    });
    if (!empleo) throw new Error("El Empleo no existe");

    //busqueda de postulaciones por empleo
    let postulations = await PostulationService.findPopulate({
      empleo: empleo._id,
      estado: CANTIDATE_COMPLETED_TEST,
    });
    if (!postulations) return res.json({ ok: true, data: [] });

    // id de los usuarios que postularon al empleo
    let arrIdUsers = postulations.map((postulacion) => postulacion.author);

    //busqueda de los test que rendieron los candidatos
    let tests = await TestService.find({ author: { $in: arrIdUsers } });

    let empleoTests = empleo.pruebas;
    let listNewPostulations = [];
    for (let item = 0; item < postulations.length; item++) {
      let newPostulation = {};
      let postulation = postulations[item];
      let author = postulation.author;
      let testsUser = tests.filter((test) => test.author === author);

      if (testsUser.length === empleoTests.length)
        newPostulation.estado_test = "Culminado";
      else if (testsUser.length >= 1 && testsUser.length < empleoTests.length)
        newPostulation.estado_test = "En Proceso";
      else if (testsUser.length === 0)
        newPostulation.estado_test = "Sin empezar";
    }

    let data = [];
    return res.json({ ok: true, data: data });
  } catch (error) {
    next(error);
  }
}

async function addScoreInterview(req, res, next) {
  try {
    const EJECUTADO = "Ejecutado";
    const NO_EJECUTADO = "No ejecutado";
    const APTO = "Apto";
    const NO_APTO = "No Apto";
    const NO_APLICA = "No Aplica";
    const APTO_CON_OBS = "Apto con obs.";

    const { userId = null } = req.session.user;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");

    const {
      score,
      commentary,
      author,
      nameAuthor,
      idPostulation,
      createdAt = new Date(),
    } = req.body;

    let postulation = await PostulationService.findOneSimple({
      _id: idPostulation,
    });

    if (!postulation) throw new Error("El proceso no existe");

    postulation.stateInterview = EJECUTADO;
    postulation.scoreInterview.push({
      score,
      commentary,
      author: JSON.stringify(userId),
      nameAuthor,
      createdAt,
    });

    let scores = postulation.scoreInterview.map((item) => item.score);
    let calculateScore = scores && scores.reduce((a, b) => a + b, 0);
    calculateScore = calculateScore / scores.length;

    if (calculateScore > 3) postulation.qualificationInterview = APTO;
    if (calculateScore === 3) postulation.qualificationInterview = APTO_CON_OBS;
    if (calculateScore < 3) postulation.qualificationInterview = NO_APTO;

    await PostulationService.updateById(postulation);
    return res.json({ ok: true, data: [] });
  } catch (error) {
    next(error);
  }
}

async function addScoreReference(req, res, next) {
  try {
    const RECIBIDAS = "Recibidas";
    const NO_RECIBIDAS = "No Recibidas";
    const APTO = "Apto";
    const NO_APTO = "No Apto";
    const NO_APLICA = "No Aplica";
    const APTO_CON_OBS = "Apto con obs.";

    const { userId = null } = req.session.user;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");

    const {
      score,
      commentary,
      author,
      nameAuthor,
      idPostulation,
      createdAt = new Date(),
    } = req.body;

    let postulation = await PostulationService.findOneSimple({
      _id: idPostulation,
    });

    if (!postulation) throw new Error("El proceso no existe");

    postulation.stateReference = RECIBIDAS;
    postulation.scoreReference.push({
      score,
      commentary,
      author: JSON.stringify(userId),
      nameAuthor,
      createdAt,
    });

    let scores = postulation.scoreReference.map((item) => item.score);
    let calculateScore = scores && scores.reduce((a, b) => a + b, 0);
    calculateScore = calculateScore / scores.length;

    if (calculateScore > 3) postulation.qualificationReference = APTO;
    if (calculateScore === 3) postulation.qualificationReference = APTO_CON_OBS;
    if (calculateScore < 3) postulation.qualificationReference = NO_APTO;

    await PostulationService.updateById(postulation);
    return res.json({ ok: true, data: [] });
  } catch (error) {
    next(error);
  }
}

async function changeStatePostulation(req, res, next) {
  try {
    const { userId = null } = req.session.user;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");

    const {
      idPostulation,
      commentary,
      state,
      score,
      newState,
      author = JSON.stringify(userId),
      createdAt = new Date(),
    } = req.body;

    let postulation = await PostulationService.findOneSimple({
      _id: idPostulation,
    });

    if (!postulation) throw new Error("El proceso no existe");

    postulation.estado = newState;
    postulation.stateChanges.push({
      author,
      commentary,
      state,
      score,
      newState,
      createdAt,
    });

    await PostulationService.updateById(postulation);
    return res.json({ ok: true, data: [] });
  } catch (error) {
    next(error);
  }
}
