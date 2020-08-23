import mongoose, { Schema } from "mongoose";

const BandaPorSexoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las Bandas necesita un Autor"]
    },
    minPuntos: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    maxPuntos: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    minLimite: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    maxLimite: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    nombre: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    mediana: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    pvalor: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
      default: 0
    },
    bandaGenero: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    }
  },
  { timestamps: true }
);

const BandaPorSexo = mongoose.model("BandaPorSexo", BandaPorSexoSchema);
export default BandaPorSexo;
