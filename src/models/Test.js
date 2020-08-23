import mongoose, { Schema } from "mongoose";

const TestSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Se necesita un Autor"],
    },
    puntaje: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    porcentaje: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    interpretacion: {
      type: String,
    },
    detalle: {
      type: Array,
    },
    tipo: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    nivel: {
      type: String,
    },
    orden: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    estado: {
      /** PENDIENTE - REALIZADO - ELIMINADO */
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    //Tiempo aproximado en que se rindio la prueba
    tiempo: {
      type: String,
    },
  },
  { timestamps: true, strict: true }
);

const Test = mongoose.model("Test", TestSchema);
export default Test;
