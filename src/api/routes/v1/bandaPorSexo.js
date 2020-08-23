import express from "express";
import BandaPorSexo from "../../../controllers/v1/bandasPorSexo";

const bandaRouter = express.Router();

//@route -> /api/banda
//@type -> GET
//@desc -> Get Bandas
//@query -> id:(UserId)?
bandaRouter.get("/", async (req, res) => {
  try {
    const bandaPorSexo = new BandaPorSexo(req);
    const response = await bandaPorSexo.getBandasPorSexo(req.query.id);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default bandaRouter;
