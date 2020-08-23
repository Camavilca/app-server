import TestService from "../../../services/v2/test";
import unlockReport from "./unlock-report";
import findTestScore from "./find-test-score.js";
import { REALIZADO } from "../../../constant/selection/postulante/test/estados";

function TestController() {
  return Object.freeze({
    unlockReport,
    create,
    findTestScore,
  });
}
export default TestController();

async function create(req, res, next) {
  try {
    const userId = req.session.user.userId || null;

    if (!userId) {
      throw new Error("Por favor inicia sesión nuevamenete.");
    }

    const {
      tiempo,
      puntaje,
      porcentaje,
      interpretacion = "",
      tipo,
      nivel,
      detalle = [],
      orden = 0,
      estado,
    } = req.body;

    // Business Rule: No se puede tener mas de una prueba
    const testExists = await TestService.find({
      author: userId,
      tipo,
      estado: REALIZADO,
    });
    if (testExists && testExists.length > 0) {
      throw new Error("Se realizó esta prueba satisfactóriamente.");
    }

    const newTest = await TestService.create({
      tiempo,
      puntaje,
      porcentaje,
      interpretacion,
      tipo,
      nivel,
      detalle,
      orden,
      estado,
      author: userId,
    });
    return res.json({
      ok: true,
      data: newTest,
    });
  } catch (error) {
    next(error);
  }
}
