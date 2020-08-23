import mongoose, { Schema } from "mongoose";

const RecommendationSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: ["true", "author required"],
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);
export default Recommendation;
