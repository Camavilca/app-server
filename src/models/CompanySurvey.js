import mongoose, { Schema } from "mongoose";

const CompanySurveySchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Por favor Ingrese a su Cuenta"],
      unique: true
    },
    respuestas: {
      type: [],
      required: false
    }
  },
  { timestamps: true, strict: true }
);

const CompanySurvey = mongoose.model("CompanySurvey", CompanySurveySchema);
export default CompanySurvey;
