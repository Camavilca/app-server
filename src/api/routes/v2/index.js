import { Router } from "express";
import blogRoutes from "./blogs";
import analyticsRoutes from "./analytics";
import userRoutes from "./users";
import testRoutes from "./tests";
import filesRoutes from "./files";
import reportsRoutes from "./reports";
import employmentRoutes from "./employment";
import favoriteEmploymentRoutes from "./favorite-employmet";
import postulationRoutes from "./postulations";
import cvsRoutes from "./cv";
import scoresRoutes from "./score";
// import keywordsRoutes from "./keywords";
import createReportRoutes from "./create-report";

const router = Router();

router.use("/blogs", blogRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);
router.use("/tests", testRoutes);
router.use("/files", filesRoutes);
router.use("/reports", reportsRoutes);
router.use("/employments", employmentRoutes);
router.use("/favorite-employments", favoriteEmploymentRoutes);

router.use("/postulations", postulationRoutes);
router.use("/cvs", cvsRoutes);
router.use("/scores", scoresRoutes);
// router.use("/keywords", keywordsRoutes);
router.use("/create-report", createReportRoutes);

export default router;
