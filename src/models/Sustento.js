import mongoose, { Schema } from "mongoose";

const SustentoSchema = new Schema(
  {
    planilla: {
      type: Schema.Types.ObjectId,
      ref: "Planilla",
      required: [true, "Los sustentos necesitan una planilla"]
    },
    codigo: {
      type: String,
      required: [true, "Ocurrio un error en el servidor."]
    },
    nombre: {
      type: String,
      required: [true, "Ocurrio un error en el servidor."]
    },
    cargo: {
      type: String,
      required: [true, "Ocurrio un error en el servidor."]
    },
    compensacion: {
      type: Number,
      required: [true, "Ocurrio un error en el servidor."]
    },
    puntos: {
      type: Number,
      required: [true, "Ocurrio un error en el servidor."]
    },
    genero: {
      type: String,
      required: [true, "Ocurrio un error en el servidor."]
    },
    banda: {
      type: String,
      required: [true, "Ocurrio un error en el servidor."]
    },
    minExcedente: {
      type: Number,
      required: [true, "Ocurrio un error en el servidor."]
    },
    maxExcedente: {
      type: Number,
      required: [true, "Ocurrio un error en el servidor."]
    },
    isAbove: {
      type: Boolean,
      required: [true, "Ocurrio un error en el servidor."]
    },
    oldSustento: {
      type: [String],
      default: []
    },
    sustento: {
      type: String,
      default: ""
    },
    estado: {
      type: Boolean,
      default: false
    },
    categoria: {
      type: [String],
      required: false
    }
  },
  { timestamps: true }
);

const Sustento = mongoose.model("Sustento", SustentoSchema);
export default Sustento;
