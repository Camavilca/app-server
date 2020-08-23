import mongoose, { Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
      unique: [true, "Ya existe un usuario con ese nombre de usuario"],
    },
    email: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
      unique: [true, "Ya existe un usuario con ese correo"],
    },
    password: String,
    token: { type: String, required: false },
    tokenTimeout: { type: Date, required: false },
    /** type: User, type: SubUser, type: AdminUser, type: SelectionUser*/
    role: { type: String, default: "User" },
    apps: [
      {
        type: Schema.Types.ObjectId,
        ref: "App",
      },
    ],
    culqiUser: { type: String, required: false },
    registerUrl: { type: String, required: false },
    author: { type: Schema.Types.ObjectId, ref: "User", required: false },
    google: { type: Number },
    facebook: { type: Number },
    //Abogado?
    permissions: [{ type: String, required: false }],
    shouldShowRecommendation: {
      type: Boolean,
      default: true,
    },
    deviceInfo: {
      client: {
        typeClient: String,
        name: String,
        version: String,
        engine: String,
        engineVersion: String,
      },
      os: { name: String, version: String, platform: String },
      device: { typeDevice: String, brand: String, model: String },
    },
  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);
export default User;
