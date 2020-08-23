import TestService from "../../../services/v2/test";
const find = async (req, res, next) => {
  try {
    const userId = req.params.id || null;
    const tests = await TestService.find({ author: userId });
    return res.json({
      ok: true,
      message: "Prueba(s) de usuario obtenido con éxito",
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

export default find;
