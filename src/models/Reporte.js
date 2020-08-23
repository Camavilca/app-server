import mongoose, { Schema } from "mongoose";

const ReporteSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Los reportes necesita un Autor"]
    },
    correo: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    nombre: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    codigo: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    id: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    documents: [
      {
        estado: Boolean,
        nombre: String,
        id: String
      }
    ]
  },
  { timestamps: true }
);

const Reporte = mongoose.model("Reporte", ReporteSchema);
export default Reporte;
