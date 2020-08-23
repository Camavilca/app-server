import mongoose, { Schema } from "mongoose";

const CargoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las applicaciones necesitan un usuario"]
    },
    tokenId: {
      type: String,
      require: [true, "Por favor llene todos los campos"]
    },
    email: {
      type: String,
      require: [true, "Por favor llene todos los campos"]
    },
    testName: {
      type: String,
      require: [true, "Por favor llene todos los campos"]
    }
  },
  { timestamps: true }
);

const Cargo = mongoose.model("Cargo", CargoSchema);
export default Cargo;
