import Puntaje from "../../../models/Puntaje";

function PuntajeService() {
  return Object.freeze({
    find,
  });
}
export default PuntajeService();

async function find({ ...args } = {}) {
  return await Puntaje.find(args);
}
