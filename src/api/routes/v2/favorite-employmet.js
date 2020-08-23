import express from "express";
import FavoriteEmploymentController from "../../../controllers/v2/favorite-employmets";

const router = express.Router();

//@route -> /api/v2/favorite-employments
//@desc -> Todos los empleos favoritos del usuario que esta en session
router.get("/", FavoriteEmploymentController.find);

export default router;
