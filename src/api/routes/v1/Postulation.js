import express from "express";
import PostulationController from "../../../controllers/v1/Postulation.Controller";
const router = express.Router();

//@route -> /api/postulations
//@type -> PUT
router.put("/", PostulationController.updateById);

export default router;
