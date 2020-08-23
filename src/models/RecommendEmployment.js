import mongoose, { Schema } from "mongoose";

const RecommendEmploymentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las recomendaciones necesitan un usuario"],
    },
    employment: {
      type: Schema.Types.ObjectId,
      ref: "Empleo",
      required: [true, "La recomendaciones necesita un Empleo"],
    },
    preference: {
      type: String,
      required: [true, "La recomendaciones necesita una preferencia"],
    },
  },
  { timestamps: true }
);

const RecommendEmployment = mongoose.model(
  "RecommendEmployment",
  RecommendEmploymentSchema
);
export default RecommendEmployment;
