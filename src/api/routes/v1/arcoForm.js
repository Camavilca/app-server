import express from "express";
import ArcoFormController from "../../../controllers/v1/ArcoForm.Controller";

const router = express.Router();

//@route -> /api/arcoform/sendEmail
//@type -> POST
//@desc -> Send email to company with ARCO form information
router.post("/sendEmail", ArcoFormController.sendARCOEmail);

export default router;
