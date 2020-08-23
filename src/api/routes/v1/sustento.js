import express from "express";
import PlanillaClass from "../../../controllers/v1/planilla";

const sustentoRouter = express.Router();

//@route -> /api/sustento
//@type -> PUT
//@desc -> Update Sustento
//@body -> { id:[String], sustento:String?, estado:Boolean? }
sustentoRouter.put("", async (req, res) => {
  try {
    const planilla = new PlanillaClass(req);
    const response = await planilla.updateSustento(req.body);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, data: err.message });
  }
});

export default sustentoRouter;
