import express from "express";
import CargoClass from "../../../controllers/v1/cargo";

const cargoRouter = express.Router();

//@route -> /api/cargo
//@type -> POST
//@desc -> Create Payment Cargo Selection => para descargar reporte
cargoRouter.post("", async (req, res) => {
  try {
    let cargoObj = new CargoClass(req);
    let response = await cargoObj.createCharges(req.body);
    await cargoObj.createCargo(req.body);
    await cargoObj.sendEmail(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err });
  }
});

cargoRouter.post("/createv2", async (req, res) => {
  try {
    let cargoObj = new CargoClass(req);
    await cargoObj.createCargo(req.body);
    return res.json(response);
  } catch (err) {
    return res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/cargo
//@type -> GET
//@desc -> Get all payments in selection reports
cargoRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let cargoObj = new CargoClass(req);
    let data = await cargoObj.getCharges(userId);
    res.json({
      ok: true,
      message: "Operacion satisfactoria",
      data,
    });
  } catch (err) {
    res.json({ ok: false, message: err });
  }
});

export default cargoRouter;
