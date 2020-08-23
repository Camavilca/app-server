import express from "express";
import analyticsController from "../../../controllers/v2/analytics";

const router = express.Router();

//@route -> /api/v2/analytics/get-score
router.post("/get-score", analyticsController.getScore);

//@route -> /api/v2/analytics/get-average-score
router.post("/get-average-score", analyticsController.getAverageScore);

export default router;
