import mongoose, { Schema } from "mongoose";

const ReporteSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Los reportes necesita un Autor"]
    },
    company: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    path: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    notes: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

const Reporte = mongoose.model("Reporte", ReporteSchema);
export default Reporte;
