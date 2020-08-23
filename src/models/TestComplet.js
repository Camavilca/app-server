import mongoose, { Schema } from "mongoose";

const TestCompletSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Se necesita un Autor"],
      unique: true
    },
    sexo: {
      type: String
    },
    edad: {
      type: String
    },
    prueba: {
      type: String
    },
    respuestas: {
      type: Array
    }
  },
  { timestamps: true, strict: true }
);

const TestComplet = mongoose.model("TestComplet", TestCompletSchema);
export default TestComplet;
