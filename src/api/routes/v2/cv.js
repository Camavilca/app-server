import CvController from "../../../controllers/v2/cv";

import { Router } from "express";
const router = Router();

//@route -> /api/v2/cvs/:author
//@type -> GET
router.get("/:author", CvController.findOneCv);

export default router;
