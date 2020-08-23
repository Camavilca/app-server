import express from "express";
import EmpleosController from "../../../controllers/v2/empleos";

const router = express.Router();

//@route -> /api/v2/empleos/by-company
//@type -> GET
//@desc -> add a test
router.get("/by-company", EmpleosController.readByCompany);

export default router;
