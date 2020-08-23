import mongoose, { Schema } from "mongoose";

const WikiSchema = new Schema(
  {
    html: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    path: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
      unique: [true, "Ya existe un wiki con esa ruta"]
    }
  },
  { timestamps: true }
);

const Wiki = mongoose.model("Wiki", WikiSchema);
export default Wiki;
