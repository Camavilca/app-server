import ScoreController from "../../../controllers/v2/score";

import { Router } from "express";
const router = Router();

//@route -> /api/v2/scores/
//@type -> POST
router.post("/", ScoreController.findScore);

//@route -> /api/v2/scores/update-all
//@type -> POST
router.post("/update-all", ScoreController.updateAllScores);

export default router;
