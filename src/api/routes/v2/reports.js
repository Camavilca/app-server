import ReportController from "../../../controllers/v2/reports";

import { Router } from "express";
const router = Router();

//@route -> /api/v2/reports
//@type -> POST
//@desc -> get a Report
router.post("/", ReportController.getReportByCode);

export default router;
