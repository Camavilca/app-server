import mongoose, { Schema } from "mongoose";

const PlanillaSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La Planilla necesita un Autor"]
    },
    procesado: {
      type: Schema.Types.Boolean,
      default: false
    },
    optimizado: {
      type: Schema.Types.Boolean,
      default: false
    },
    workers: [{ type: Schema.Types.ObjectId, ref: "Worker" }],
    sustentos: [{ type: Schema.Types.ObjectId, ref: "Sustento" }]
  },
  { timestamps: true }
);

const Planilla = mongoose.model("Planilla", PlanillaSchema);
export default Planilla;
