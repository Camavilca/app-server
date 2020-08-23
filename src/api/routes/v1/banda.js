import express from "express";
import BandaClass from "../../../controllers/v1/bandas";
import PlanillaClass from "../../../controllers/v1/planilla";

const bandaRouter = express.Router();

//@route -> /api/banda
//@type -> GET
//@desc -> Get Bandas
//@query -> id:(UserId)?
bandaRouter.get("", async (req, res) => {
  try {
    const banda = new BandaClass(req);
    const response = await banda.getBandas(req.query.id);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/banda
//@type -> POST
//@desc -> Add Banda
//@body -> { id(UserId), minPuntos:Number, maxPuntos:Number, mediana:Number, cambio:Number, nombre:String }
bandaRouter.post("", async (req, res) => {
  try {
    const banda = new BandaClass(req);
    const planilla = new PlanillaClass(req);
    const bandas = await banda.createBanda(req.body);
    await planilla.createSustentos(bandas.data.author);
    let planillas = await planilla.getPlanilla({ author: bandas.data.author });

    res.json({
      ok: true,
      data: { banda: bandas.data, planilla: planillas.data[0] },
    });
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route ->	/api/banda
//@type -> PUT
//@desc ->	Update Banda
//@body -> { id(BandaId), minPuntos:Number, maxPuntos:Number, mediana:Number, cambio:Number, nombre:String }
bandaRouter.put("", async (req, res) => {
  try {
    const banda = new BandaClass(req);
    const planilla = new PlanillaClass(req);
    const updatedBanda = await banda.updateBanda(req.body);
    await planilla.createSustentos(updatedBanda.data.author);
    let planillas = await planilla.getPlanilla({
      author: updatedBanda.data.author,
    });

    res.json({
      ok: true,
      data: { planilla: planillas.data[0], banda: updatedBanda.data },
    });
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/banda/(BandaId)
//@type -> DELETE
//@desc -> Delete Banda
bandaRouter.delete("/:id", async (req, res) => {
  try {
    const banda = new BandaClass(req);
    const response = await banda.deleteBanda(req.params.id);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default bandaRouter;
