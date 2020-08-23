import express from "express";
import DocumentController from "../../../controllers/v1/Document.Controller";

const router = express.Router();

//@route -> /api/myReports/createFreeReport
//@type -> GET
//@desc -> Create a free report
router.get("/createFreeReport/:userId", DocumentController.createFreeReport);

//@route -> /api/myReports/createCompleteReport
//@type -> GET
//@desc -> Create a complete report
router.get(
  "/createCompleteReport/:userId",
  DocumentController.createCompleteReport
);

//@route -> /api/myReports/createProfessionalProfileReport
//@type -> GET
//@desc -> Create a complete report
router.get(
  "/createProfessionalProfileReport/:userId",
  DocumentController.createProfessionalProfileReport
);

export default router;
