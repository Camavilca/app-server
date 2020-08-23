import mongoose, { Schema } from "mongoose";

const PonderacionSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las ponderaciones necesita un Autor"]
    },
    puestos: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    gradoInstruccion: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    experienciaLaboral: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    habilidadesCognitivas: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    habilidadesInterdiciplinarias: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    habilidadesComunicativas: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    mental: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    fisico: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    manejoDelPersonal: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    manejoInformacion: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    manejoRecursosEconomicos: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    ejercicioFunciones: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    riesgo: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    }
  },
  { timestamps: true, strict: true, collection: "ponderacion" }
);

const Ponderacion = mongoose.model("Ponderaciones", PonderacionSchema);
export default Ponderacion;
