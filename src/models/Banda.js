import mongoose, { Schema } from "mongoose";

const BandaSchema = new Schema(
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
    minSueldo: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    maxSueldo: {
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
    }
  },
  { timestamps: true }
);

const Banda = mongoose.model("Banda", BandaSchema);
export default Banda;
