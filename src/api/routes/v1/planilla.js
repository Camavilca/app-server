import express from "express";
import PlanillaClass from "../../../controllers/v1/planilla";

const planillaRouter = express.Router();

//@route -> /api/planilla
//@type -> GET
//@desc -> Get Planilla || Search Planilla
//@query -> id:(UserId)?, search:String
planillaRouter.get("", async (req, res) => {
  try {
    let response;
    const planilla = new PlanillaClass(req);
    !req.query.search
      ? (response = await planilla.getPlanilla({
          author: req.query.id ? req.query.id : req.session.user.userId,
        }))
      : (response = await planilla.getPlanilla(
          {
            author: req.query.id ? req.query.id : req.session.user.userId,
          },
          {
            $or: [
              { codigo: req.query.search },
              { puesto: req.query.search },
              { nivel: req.query.search },
            ],
          }
        ));
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default planillaRouter;
