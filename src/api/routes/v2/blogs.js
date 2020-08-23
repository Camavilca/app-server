import express from "express";
import BlogController from "../../../controllers/v1/blog-controller";

const router = express.Router();

//@route -> /api/v2/blogs
router.get("/", BlogController.findAll);

//@route -> /api/v2/blogs/increment-by-code
//@desc -> Incrementar el contador de clicks de un determinado blog
router.post("/increment-by-code", BlogController.incrementCounterByCode);

export default router;
