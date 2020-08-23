import mongoose, { Schema } from "mongoose";

const AdminUserInfoSchema = new Schema(
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
    dni: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    },
    telefono: {
      type: String,
      required: [true, "Por favor complete todos los campos"]
    }
  },
  { timestamps: true, strict: true }
);

const AdminUserInfo = mongoose.model("AdminUserInfo", AdminUserInfoSchema);
export default AdminUserInfo;
