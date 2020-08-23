import mongoose, { Schema } from "mongoose";

const EditedSchema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: [
        true,
        "Los Documentos editados necesitan un documento de referencia"
      ]
    },
    html: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    diff: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    summary: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    type: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    respuestas: []
  },
  { timestamps: true }
);

const Edited = mongoose.model("Edited", EditedSchema);
export default Edited;
