import express from "express";
import UserController from "../../../controllers/v2/users";

const router = express.Router();

//@route -> /api/v2/users/:id
router.get("/:id", UserController.updateById);

//@route -> /api/v2/users/:id/tests
router.get("/:id/tests", UserController.getUserTests);

export default router;
