import { Router } from "express";
import v1Routes from "./routes/v1";
import v2Routes from "./routes/v2";

const router = Router();

router.use("/", v1Routes);
router.use("/v2", v2Routes);

export default router;
