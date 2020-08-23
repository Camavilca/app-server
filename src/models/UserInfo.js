import mongoose, { Schema } from "mongoose";

const UserInfoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La informacion de usuario necesita un Autor"],
      unique: true
    },
    nombre: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    direccion: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    ruc: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    telefono: {
      type: Number,
      required: [true, "Por favor complete todos los campos"]
    },
    distrito: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    sector_empresarial: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    ciiu: {
      type: Number,
      required: [true, "Por favor complete todos los campos"]
    },
    descripcion_ciiu: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    }
  },
  { timestamps: true, strict: true }
);

const UserInfo = mongoose.model("UserInfo", UserInfoSchema);
export default UserInfo;
