import mongoose, { Schema } from "mongoose";

const PuntajePuestoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Los Puestos con Puntaje necesitan un author"]
    },
    puesto: {
      type: String,
      required: true
    },
    puntajes: {
      type: Object,
      required: false
    }
  },
  { timestamps: true }
);

const PuntajePuesto = mongoose.model("PuntajePuesto", PuntajePuestoSchema);
export default PuntajePuesto;
