import mongoose, { Schema } from "mongoose";

const CvSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    path: {
      type: String,
      required: false,
    },
    id: {
      type: String,
      required: false,
    },
    ruta: {
      type: String,
      required: false,
    },
    nombre: {
      type: String,
      required: false,
    },
    correo: {
      type: String,
      required: false,
    },
    telefono: {
      type: String,
      required: false,
    },
    grado: {
      type: String,
      required: false,
    },
    universidad: {
      type: String,
      required: false,
    },
    words: {
      type: String,
      required: false,
    },
    puesto: {
      type: String,
      required: false,
    },
    goodwords: {
      type: Number,
      required: false,
    },
    puntajes: [{ type: Schema.Types.ObjectId, ref: "Puntaje" }],
  },
  { timestamps: true }
);

const Cv = mongoose.model("Cv", CvSchema);
export default Cv;
