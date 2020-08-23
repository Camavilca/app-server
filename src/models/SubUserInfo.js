import mongoose, { Schema } from "mongoose";

const SubUserInfoSchema = new Schema(
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
    codigo: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    cargo: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    }
  },
  { timestamps: true, strict: true }
);

const SubUserInfo = mongoose.model("SubUserInfo", SubUserInfoSchema);
export default SubUserInfo;
