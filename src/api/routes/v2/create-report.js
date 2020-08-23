import ReportsController from "../../../controllers/v2/reports";

import { Router } from "express";
const router = Router();

// @route -> /api/v2/create-report/report-test-by-employment
// @type -> POST
router.post(
  "/report-test-by-employment",
  ReportsController.createReportTestByEmployment
);

export default router;
