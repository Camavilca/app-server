import mongoose, { Schema } from "mongoose";

const FavoritoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La informacion de usuario necesita un Autor"],
    },
    empleo: {
      type: Schema.Types.ObjectId,
      ref: "Empleo",
      required: [true, "La informacion necesita un Empleo"],
    },
    estado: {
      type: String,
      required: [true, "Por favor complete todos los campos"],
    },
  },
  { timestamps: true, strict: true }
);

const Favorito = mongoose.model("Favorito", FavoritoSchema);
export default Favorito;
