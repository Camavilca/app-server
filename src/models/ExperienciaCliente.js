import mongoose, { Schema } from "mongoose";

const ExperienciaClienteSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Necesita un Usuario"]
    },
    estado: {
      type: String,
      required: [true, "Se requiere el Estado"]
    },
    instrucciones: {
      type: String
    },
    tiempo: {
      type: String
    },
    design: {
      type: String
    },
    detalleDesign: {
      type: String
    },
    dificultad: {
      type: String
    },
    detalleDificultad: {
      type: String
    }
  },
  { timestamps: true }
);

const ExperienciaCliente = mongoose.model(
  "ExperienciaCliente",
  ExperienciaClienteSchema
);
export default ExperienciaCliente;
