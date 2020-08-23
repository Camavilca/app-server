import mongoose, { Schema } from "mongoose";

const HistorialReporteSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las Bandas necesita un Autor"]
    },
    nombre: {
      type: String,
      required: [true, "Por favor registre todos los campos"]
    },
    contador: {
      type: Number,
      required: [true, "Por favor registre todos los campos"]
    },
    route: {
      type: String,
      required: [true, "Ocurrio un error"]
    }
  },
  { timestamps: true }
);

const HistorialReporte = mongoose.model(
  "HistorialReporte",
  HistorialReporteSchema
);
export default HistorialReporte;
