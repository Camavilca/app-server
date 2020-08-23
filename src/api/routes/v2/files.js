import { Router } from "express";
import FilesController from "../../../controllers/v2/files";

const router = Router();

//@route -> /api/v2/files/uploads/curriculumVitae/
router.post("/uploads/curriculumVitae", FilesController.uploadCV);

//@route -> /api/v2/files/downloads/reports/:code
router.post("/downloads/reports/:code", FilesController.downloadReport);

export default router;
