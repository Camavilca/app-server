import mongoose, { Schema } from "mongoose";

const ArchivoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La informacion de usuario necesita un Autor"],
    },
    nombre: {
      type: String,
      required: [true, "Por favor complete todos los campos"],
    },
    tipo: {
      type: String,
      required: [true, "Por favor complete todos los campos"],
    },
    estado: {
      type: String,
    },
    ruta: {
      type: String,
    },
  },
  { timestamps: true, strict: true }
);

const Archivo = mongoose.model("Archivo", ArchivoSchema);
export default Archivo;
