import userRoutes from "./user";
import uploadRoutes from "./upload";
import planillaRoutes from "./planilla";
import bandaRoutes from "./banda";
import documentRoutes from "./document";
import sustentoRoutes from "./sustento";
import factorRoutes from "./factor";
import reporteRoutes from "./reporte";
import adminRoutes from "./admin";
import pagoRoutes from "./pago";
import cargoRoutes from "./cargo";
import reclutamientoRoutes from "./reclutamiento";
import pruebasRoutes from "./pruebas";
import analisisRoutes from "./analisis";
import wikiRoutes from "./wiki";
import bandaPorSexoRoutes from "./bandaPorSexo";
import ponderacionRoutes from "./ponderacion";
import arcoFormRoutes from "./arcoForm";
import MyReportsRoutes from "./MyReports";
import NotificationRoutes from "./Notification";
import PostulationRoutes from "./Postulation";

import { Router } from "express";

const router = Router();

router.use("/users", userRoutes);
router.use("/upload", uploadRoutes);
router.use("/planilla", planillaRoutes);
router.use("/banda", bandaRoutes);
router.use("/bandaPorSexo", bandaPorSexoRoutes);
router.use("/document", documentRoutes);
router.use("/sustento", sustentoRoutes);
router.use("/factor", factorRoutes);
router.use("/reporte", reporteRoutes);
router.use("/admin", adminRoutes);
router.use("/pago", pagoRoutes);
router.use("/cargo", cargoRoutes);
router.use("/reclutamiento", reclutamientoRoutes);
router.use("/pruebas", pruebasRoutes);
router.use("/analisis", analisisRoutes);
router.use("/wiki", wikiRoutes);
router.use("/ponderacion", ponderacionRoutes);
router.use("/arcoform", arcoFormRoutes);
router.use("/myReports", MyReportsRoutes);
router.use("/notification", NotificationRoutes);
router.use("/postulations", PostulationRoutes);

export default router;
