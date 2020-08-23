import express from "express";
import PostulationController from "../../../controllers/v2/postulations";

const router = express.Router();

//@route -> /api/v2/postulations
// TODO: cambiar a get porque no tiene sentido
router.post("/", PostulationController.find);

//@route -> /api/v2/postulations/add-score-interview
//@desc -> agregar un puntaje y commentario en la estato entrevista
router.post("/add-score-interview", PostulationController.addScoreInterview);

//@route -> /api/v2/postulations/add-score-reference
//@desc -> agregar un puntaje y comentario en la estato referencia
router.post("/add-score-reference", PostulationController.addScoreReference);

//@route -> /api/v2/postulations/change-state-postulation
//@desc -> cambio de estado de la postulacion de un candidato
router.post(
  "/change-state-postulation",
  PostulationController.changeStatePostulation
);

//@route -> /api/v2/postulations/postulations-by-job
//@desc -> postulaciones por empleo
router.get(
  "/postulations-by-job",
  PostulationController.getAllPostulationsByJob
);

//@route -> /api/v2/postulations/by-job-stage
//@type -> GET
//@desc -> read all postulations by job
router.get("/by-job-stage", PostulationController.getPostulationsByJob);

//@route -> /api/v2/postulations/candidate-completed-test
//@type -> GET
//@desc -> read all candidate completed test
router.get(
  "/candidate-completed-test",
  PostulationController.getCandidateCompletedTest
);

//@route -> /api/v2/postulations/count-stage-postulations
//@type -> GET
//@desc -> count stage postulations by job
router.get(
  "/count-stage-postulations",
  PostulationController.countStagePostulationsByJob
);

// route=>    /api/v2/postulations/test-get-jobs
router.get("/test-get-jobs", PostulationController.getPostulationsByJob2);

export default router;
