import express from "express";
import EmploymentController from "../../../controllers/v2/employments";

const router = express.Router();

//@route -> /api/v2/employments
//@desc -> Incrementar el contador de clicks de un determinado blog
router.post("/", EmploymentController.create);

//@route -> /api/v2/employments/remove-recommended-job
//@desc -> Eliminar empleo de los empleos Recomendados
router.post(
  "/remove-recommended-job",
  EmploymentController.removeRecommendedJob
);

//@route -> /api/v2/employments/change-state-employment
//@desc -> Cambio de estado del empleo
//@params -> state -  idEmployment
router.post(
  "/change-state-employment",
  EmploymentController.changeStateEmployment
);

//@route -> /api/v2/employments
router.get("/", EmploymentController.find);

//@route -> /api/v2/employments/all-employments
router.get("/all-employments", EmploymentController.findAll);

//@route -> /api/v2/employments/all-employments-scrapy
// router.get("/all-employments-scrapy", EmploymentController.findAllScrapy);

//@route -> /api/v2/employments/recommended-jobs
router.get("/recommended-jobs", EmploymentController.getRecommendedJobs);

//@route -> /api/v2/employments/by-company
//@desc -> Incrementar el contador de clicks de un determinado blog
router.get("/by-company", EmploymentController.findByCompany);

//@route -> /api/v2/employments/find-jobs-by-date
//@desc -> busqueda todos los empleos activos que se diferencian de empleos favoritos y postulados
router.get("/find-jobs-by-date", EmploymentController.findJobsByDate);

//@route -> /api/v2/employments/find-jobs-by-description-or-name
//@desc -> busqueda por la descripción del puesto o por el nombre del puesto
router.get(
  "/find-jobs-by-description-or-name",
  EmploymentController.findJobsByDescriptionOrName
);

//@route -> /api/v2/employments/find-employment
//@desc -> busqueda por la descripción del puesto o por el nombre del puesto
router.get("/find-employment", EmploymentController.findEmployment);

//@route -> /api/v2/employments/find-employment-id
//@desc -> busqueda por la descripción del puesto o por el nombre del puesto
router.get("/find-employment-id", EmploymentController.findEmploymentId);

export default router;
