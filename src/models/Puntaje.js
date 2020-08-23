import mongoose, { Schema } from "mongoose";

const PuntajeSchema = new Schema(
  {
    cv: {
      type: Schema.Types.ObjectId,
      ref: "Cv",
      required: ["true", "Please add a CV reference"],
    },
    keyword: {
      type: Schema.Types.ObjectId,
      ref: "Keyword",
      required: ["true", "Please add a dicctionary/keywords reference"],
    },
    puesto: {
      type: String,
      required: false,
    },
    puntaje: {
      type: Number,
      required: false,
    },
    nivel: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Puntaje = mongoose.model("Puntaje", PuntajeSchema);
export default Puntaje;
