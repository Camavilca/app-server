import UserInfoService from "../../../services/v2/user-info";
import PostulationService from "../../../services/v2/postulation";
import PonderationTestService from "../../../services/v2/ponderation-test";
import TestService from "../../../services/v2/test";
import CvService from "../../../services/v2/cv";
import PuntajeService from "../../../services/v2/puntaje";
import {
  regularInfo,
  encryptInfo,
  defaultInfoPostulation,
  encryptonInfoPostulation,
} from "../../../util/helpers";
import {
  REGULAR,
  SEMICIEGA,
} from "../../../constant/selection/empresa/empleos/tipo-seleccion";
import {
  CANTIDATE_UPLOADED_CV,
  CANTIDATE_COMPLETED_TEST,
  CANTIDATE_COMPLETED_PRE_INTERVIEW,
  CANTIDATE_REFERENCES_SENT,
  CANTIDATE_CLIENT_INTERVIEW_DONE,
  CANTIDATE_CLOSED_PROCESS,
  CANTIDATE_HIRED,
  NO_APTO,
  APTO,
  NO_APLICA,
  TEST_WITHOUT_STARTING,
  TEST_IN_PROCESS,
  TEST_COMPLET,
} from "../../../constant/selection/empresa/empleos/my-postulation";
import {
  NAME_DONATELLO,
  NAME_DARTAGNAN,
  NAME_SOCIAL,
  NAME_LIDERAZGOGOLEN,
  NAME_MOSS,
  NAME_INTELIGENCIA,
  NAME_BAP7,
  NAME_BAP6,
  NAME_CAMBIOS,
  NAME_D48VR,
  NAME_EMPRENDIMIENTO,
  NAME_ASERTIVIDAD,
  NAME_APTITUD_VERBAL,
} from "../../../constant/selection/postulante/test/names";
import allTests from "./tests";

const SCORE_LESS = 70;
const SCORE_HIGHER = 75;
const SCORE_CV = 0.7;

export const getPostulationsDefault = async (employment) => {
  let employmentId = employment._id;
  let postulations = await PostulationService.findSimple({
    empleo: employmentId,
    estado: { $ne: CANTIDATE_CLOSED_PROCESS },
  });

  let data = await buildPostulationsJson({
    employment: employment,
    postulations: postulations,
  });
  return data;
};

/**
 * @state : CANTIDATE_UPLOADED_CV
 * @desc se lista todos los candidatos que postularon que tengan un match menor a 70%
 */
export const getStageCvs = async (employment) => {
  let data = [];
  /** todas las postulaciones por empleo y por estado */
  let postulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_UPLOADED_CV,
  });

  /** ids de todos los authores o usuarios que postularon*/
  let postulationsAuthorIds = postulations.map(
    (postulation) => postulation.author
  );

  /** todos los cvs de los usuarios que postularon al empleo*/
  let cvs = await CvService.find({ author: { $in: postulationsAuthorIds } });

  /** ids de todos los cvs para poder buscar los puntajes */
  let cvsIds = cvs.map((cv) => cv._id);

  /** todos los puntajes en base a todos los ids de los cvs */
  let scores = await PuntajeService.find({
    keyword: employment.dictionary,
    cv: { $in: cvsIds },
  });

  /**  */
  let userSelectionsInfos = await UserInfoService.findUserSelectionInfoPopulate(
    {
      author: { $in: postulationsAuthorIds },
    }
  );

  userSelectionsInfos.map((userinfo) => {
    let author = userinfo.author._id;
    /** busqueda de la postulacion por usuario - author */
    let postulation = postulations.find(
      (userinfo) => JSON.stringify(userinfo.author) === JSON.stringify(author)
    );
    /** busqueda del cv por usuario - author */
    let cv = cvs.find(
      (cv) => JSON.stringify(cv.author) === JSON.stringify(author)
    );
    /** busqueda del score por usuario - author */
    let score = scores.find(
      (score) => JSON.stringify(score.cv) === JSON.stringify(cv._id)
    );
    // console.log("getStageCvs -> score", score, !score);

    let resultScore = 0;

    /** verificamos si el score existe para despues hacer el calculo */
    if (!score || typeof score === "undefined") {
      // console.log("getStageCvs -> score IF");
      resultScore = 0;
    } else {
      // console.log("getStageCvs -> score else", score);
      if (score.puntaje - Math.floor(score.puntaje) === 0) {
        resultScore = (score.puntaje * 100).toFixed(0);
      } else {
        resultScore = (score.puntaje * 100).toFixed(2);
      }
    }

    /** seteamos el valor del score a la postulation.scoreCV*/
    postulation.scoreCv = resultScore;

    /** SCORE_CV  tiene que ser variable porque el psicologico o encargado del proceso podra cambiar  */
    let percentageToCalculateCv = 0;
    if (
      employment.percentageToCalculateCv !== null &&
      typeof employment.percentageToCalculateCv !== "undefined"
    ) {
      //valor entero de 0 - 100
      percentageToCalculateCv = employment.percentageToCalculateCv / 100;
    } else {
      percentageToCalculateCv = SCORE_CV;
    }

    if (!score || typeof score === "undefined") {
      data.push(defaultInfoPostulation({ userinfo, postulation, employment }));
    } else if (score.puntaje >= percentageToCalculateCv) {
      /** seteamos el valor del estado a la postulation.scoreCV*/
      postulation.estado = CANTIDATE_COMPLETED_TEST;
    } else {
      if (employment.tipoSelection === SEMICIEGA) {
        data.push(
          encryptonInfoPostulation({
            userinfo,
            postulation,
            employment,
          })
        );
      }
      if (employment.tipoSelection === REGULAR) {
        data.push(
          defaultInfoPostulation({ userinfo, postulation, employment })
        );
      }
    }

    PostulationService.updateById(postulation);
  });
  return data;
};

/***
 * @state : CANTIDATE_COMPLETED_TEST
 * @desc se lista todos los candidatos que postularon que tengan un match mayor a 70%
 */
export const getStageTests = async (employment) => {
  /** todas las postulaciones por empleo y por estado */
  let postulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_COMPLETED_TEST,
  });

  /** ids de todos los authores o usuarios que postularon*/
  let postulationsAuthorIds = postulations.map(
    (postulation) => postulation.author
  );

  /** todos los tests que ya fueron rendidos por los candidatos que postularon al empleo*/
  let tests = await TestService.find({
    author: { $in: postulationsAuthorIds },
  });

  /** pruebas que tiene el empleo - se llama al getTest para tomar @type, @name, @description */
  let allTestsOfEmployment = getTests(employment.pruebas);

  postulations.map((postulation) => {
    let author = postulation.author;
    /** filtramos los test por usuario o author */
    let postulatorTests = tests.filter(
      (test) => JSON.stringify(test.author) === JSON.stringify(author)
    );

    let arrIncompleteTests = [];
    let arrCompleteTests = [];
    let arrCompleteTestDetail = [];

    // calculo de los test que rindio el postulador
    for (let item = 0; item < allTestsOfEmployment.length; item++) {
      const testOfEmployment = allTestsOfEmployment[item];
      var testComplet = postulatorTests.find(
        (item) => item.tipo === testOfEmployment.type
      );
      if (typeof testComplet === "undefined") {
        arrIncompleteTests.push(testOfEmployment);
      } else {
        arrCompleteTests.push(testOfEmployment);
        arrCompleteTestDetail.push(testComplet);
      }
    }

    let calculateScore = calculateScoreByTests({
      tests: arrCompleteTestDetail,
      testLength: allTestsOfEmployment.length,
    });

    postulation.scoreTest = calculateScore;

    let percentageToCalculateTest = 0;
    if (
      employment.percentageToCalculateTest !== null &&
      typeof employment.percentageToCalculateTest !== "undefined"
    ) {
      percentageToCalculateTest = employment.percentageToCalculateTest;
    } else {
      percentageToCalculateTest = SCORE_LESS;
    }

    if (arrCompleteTests.length === allTestsOfEmployment.length) {
      postulation.qualificationTest = TEST_COMPLET;
      if (calculateScore > percentageToCalculateTest) {
        postulation.estado = CANTIDATE_COMPLETED_PRE_INTERVIEW;
        postulation.stateTest = APTO;
      } else {
        postulation.stateTest = NO_APTO;
      }
    } else if (
      arrCompleteTests.length >= 1 &&
      arrCompleteTests.length < allTestsOfEmployment.length
    ) {
      postulation.stateTest = NO_APLICA;
      postulation.qualificationTest = TEST_IN_PROCESS;
    } else if (arrCompleteTests.length <= 0) {
      postulation.stateTest = NO_APLICA;
      postulation.qualificationTest = TEST_WITHOUT_STARTING;
    }
    postulation.arrIncompleteTests = arrIncompleteTests;
    postulation.arrCompleteTests = arrCompleteTests;
    PostulationService.updateById(postulation);
  });

  let allPostulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_COMPLETED_TEST,
  });

  let data = await buildPostulationsJson({
    employment,
    postulations: allPostulations,
  });
  return data;
};

//@state : CANTIDATE_COMPLETED_PRE_INTERVIEW
//@desc se lista todos los candidatos que culminaron con los test

export const getStagePreInterview = async (employment) => {
  let postulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_COMPLETED_PRE_INTERVIEW,
  });
  let data = await buildPostulationsJson({
    employment: employment,
    postulations: postulations,
  });
  return data;
};

//@state : CANTIDATE_REFERENCES_SENT
//@desc se lista todos los candidatos que pasaron por las entrevistas
export const getStageReference = async (employment) => {
  let postulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_REFERENCES_SENT,
  });
  let data = await buildPostulationsJson({
    employment: employment,
    postulations: postulations,
  });
  return data;
};

//@state : CANTIDATE_CLIENT_INTERVIEW_DONE
//@desc se lista todas los postulaciones que pasaron la entrevista
export const getStateFinalists = async (employment) => {
  let postulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_CLIENT_INTERVIEW_DONE,
  });
  let data = await buildPostulationsJson({
    employment: employment,
    postulations: postulations,
  });
  return data;
};

//@state : CANTIDATE_HIRED
//@desc se lista todos los candidatos que son contratados
export const getStateHired = async (employment) => {
  let postulations = await PostulationService.find({
    empleo: employment._id,
    estado: CANTIDATE_HIRED,
  });
  let data = await buildPostulationsJson({
    employment: employment,
    postulations: postulations,
  });
  return data;
};

const buildPostulationsJson = async ({ employment, postulations }) => {
  let data = [];

  let postulationsAuthorIds = postulations.map(
    (postulation) => postulation.author
  );

  let userSelectionsInfos = await UserInfoService.findUserSelectionInfoPopulate(
    {
      author: { $in: postulationsAuthorIds },
    }
  );

  // $nin => diferentes a los valores que ingresas

  if (employment.tipoSelection === REGULAR) {
    userSelectionsInfos.map((userinfo) => {
      let author = userinfo.author._id;
      let objPostulation = postulations.find(
        (postulation) =>
          JSON.stringify(postulation.author) === JSON.stringify(author)
      );
      data.push(
        defaultInfoPostulation({
          userinfo,
          postulation: objPostulation,
          employment,
        })
      );
    });
  }
  if (employment.tipoSelection === SEMICIEGA) {
    userSelectionsInfos.map((userinfo) => {
      let author = userinfo.author._id;
      let objPostulation = postulations.find(
        (postulation) =>
          JSON.stringify(postulation.author) === JSON.stringify(author)
      );
      data.push(
        encryptonInfoPostulation({
          userinfo,
          postulation: objPostulation,
          employment,
        })
      );
    });
  }

  return data;
};

const buildPostulationsJson22 = async ({ employment, postulations }) => {
  let data = [];

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
      else resultScore = (score.puntaje * 100).toFixed(2);

      data.push({
        idPostulation: objPostulation._id,
        stateInterview: objPostulation.stateInterview,
        scoreInterview: objPostulation.scoreInterview,
        qualificationInterview: objPostulation.qualificationInterview,
        stateReference: objPostulation.stateReference,
        scoreReference: objPostulation.scoreReference,
        qualificationReference: objPostulation.qualificationReference,
        ...regularInfo(
          item,
          objPostulation,
          employment.tipoSelection,
          resultScore
        ),
      });
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

      data.push({
        idPostulation: objPostulation._id,
        stateInterview: objPostulation.stateInterview,
        scoreInterview: objPostulation.scoreInterview,
        qualificationInterview: objPostulation.qualificationInterview,
        stateReference: objPostulation.stateReference,
        scoreReference: objPostulation.scoreReference,
        qualificationReference: objPostulation.qualificationReference,
        ...encryptInfo(
          item,
          objPostulation,
          employment.tipoSelection,
          resultScore
        ),
      });
    });
  }

  return data;
};

function calculateScoreByTests({ tests, testLength }) {
  let score = 0;
  tests.map((test) => {
    switch (test.tipo) {
      case NAME_DONATELLO:
        let porcentagesDonatello = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        score += Math.max(...porcentagesDonatello);
        break;
      case NAME_DARTAGNAN:
        score += test.porcentaje;
        break;
      case NAME_SOCIAL:
        let porcentagesSocial = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        var calculatePercentage = porcentagesSocial.reduce((a, b) => a + b, 0);
        calculatePercentage = calculatePercentage / test.detalle.length;
        score += calculatePercentage;
        break;
      case NAME_LIDERAZGOGOLEN:
        let porcentagesLiderazgo = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        score += Math.max(...porcentagesLiderazgo);
        break;
      case NAME_MOSS:
        score += 1;
        let porcentagesMoss = test.detalle.map((detailt) =>
          parseInt(detailt.porcentaje)
        );
        var calculatePercentage = porcentagesMoss.reduce((a, b) => a + b, 0);
        calculatePercentage = calculatePercentage / test.detalle.length;
        score += calculatePercentage;
        break;
      case NAME_INTELIGENCIA:
        score += test.porcentaje;
        break;
      case NAME_BAP7:
        score += test.porcentaje;
        break;
      case NAME_BAP6:
        score += test.porcentaje;
        break;
      case NAME_CAMBIOS:
        score += test.porcentaje;
        break;
      case NAME_D48VR:
        score += test.porcentaje;
        break;
      case NAME_EMPRENDIMIENTO:
        score += test.porcentaje;
        break;
      case NAME_ASERTIVIDAD:
        score += test.porcentaje;
        break;
      case NAME_APTITUD_VERBAL:
        score += test.porcentaje;
        break;
    }
  });

  let calculateScore = score / testLength;
  if (isNaN(calculateScore)) {
    return 0;
  } else {
    return calculateScore;
  }
}

const getFullName = (userinfo) => {
  var name = userinfo.nombre ? userinfo.nombre : "";
  var paternal = userinfo.paterno ? userinfo.paterno : "";
  var maternal = userinfo.materno ? userinfo.materno : "";
  return `${name} ${paternal} ${maternal}`;
};

const getTests = (employmentTests) => {
  let arrAllTest = [];
  allTests.map((test) => {
    if (employmentTests.includes(test.type)) arrAllTest.push(test);
  });
  return arrAllTest;
};

// PonderationTestService.findTestScore({
//   test: test.tipo,
//   area: employment.areaPuesto,
//   positionLevel: employment.nivelPuesto,
//   testLevel: test.nivel,
// });
