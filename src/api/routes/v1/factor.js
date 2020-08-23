import express from "express";
import FactorClass from "../../../controllers/v1/factores";

const factorRouter = express.Router();

//@route -> /api/factor
//@type -> GET
//@desc -> Get Factors
//@query -> id(userId)?
factorRouter.get("", async (req, res) => {
  try {
    const factor = new FactorClass(req);
    const response = await factor.getFactors(req.query.id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/factor/create
//@type -> POST
//@desc -> Create Factor
//@body -> { id(UserId), categoria:String, nombre:String, peso:Number, no_niveles:Number }
factorRouter.post("/create", async (req, res) => {
  try {
    const factor = new FactorClass(req);
    const response = await factor.createFactor(req.body);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/factor
//@type -> PUT
//@desc -> Update Factor
//@body -> { id(UserId), categoria:String, nombre:String, peso:Number, no_niveles:Number }
factorRouter.put("", async (req, res) => {
  try {
    const factor = new FactorClass(req);
    const response = await factor.updateFactor(req.body);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/factor/(FactorId)
//@type -> DELETE
//@desc -> Delete Factor
factorRouter.delete("/:id", async (req, res) => {
  try {
    const factor = new FactorClass(req);
    const response = await factor.deleteFactor(req.params.id);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default factorRouter;
