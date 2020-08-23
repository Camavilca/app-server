import UserService from "../../../services/v2/user";
import TestService from "../../../services/v2/test";

function UserController() {
  return Object.freeze({
    updateById,
    getUserTests,
  });
}
export default UserController();

async function updateById(req, res, next) {
  try {
    const userId = req.params.id;
    const data = req.body;
    const updatedUser = await UserService.updateById(userId, data);
    return res.json({
      ok: true,
      message: "Actualizado con éxito.",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserTests(req, res, next) {
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
}
