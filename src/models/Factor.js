import mongoose, { Schema } from "mongoose";

const FactorSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Los Factores necesita un Autor"]
    },
    key: {
      type: Number,
      required: false
    },
    categoria: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    nombre: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    peso: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    },
    no_niveles: {
      type: Number,
      required: [true, "Por favor llene todos los campos"]
    }
  },
  { timestamps: true }
);

const Factor = mongoose.model("Factor", FactorSchema);
export default Factor;
