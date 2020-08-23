import TestController from "../../../controllers/v2/tests";

import { Router } from "express";
const router = Router();

//@route -> /api/v2/tests
//@type -> POST
//@desc -> add a test
router.post("/", TestController.create);

//@route -> /api/v2/tests/unlock
//@type -> POST
//@desc -> unlock some test (save in charges collection model)
router.post("/unlock", TestController.unlockReport);

//@route -> /api/v2/tests/score
//@type -> POST
//@desc -> unlock some test (save in charges collection model)
router.post("/score", TestController.findTestScore);

export default router;
