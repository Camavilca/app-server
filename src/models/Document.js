import mongoose, { Schema } from "mongoose";

const DocumentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Los Documentos necesita un Autor"]
    },
    nombre: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    estado: {
      type: Boolean,
      default: false
    },
    isView: {
      type: Boolean,
      default: false
    },
    notas: {
      type: String,
      default: ""
    },
    route: {
      type: String,
      required: [true, "Ocurrio un error"]
    },
    type: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    }
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", DocumentSchema);
export default Document;
