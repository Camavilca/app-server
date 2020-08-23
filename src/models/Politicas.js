import mongoose, { Schema } from "mongoose";

const PoliticaSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las Politicas necesita un Autor"]
    },
    tipo: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    respuestas: [],
    estado: {
      /** PENDIENTE - REALIZADO - ELIMINADO */
      type: String,
      required: [true, "Por favor llene todos los campos"]
    }
  },
  { timestamps: true }
);

const Politica = mongoose.model("Politica", PoliticaSchema);
export default Politica;
