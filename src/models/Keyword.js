import mongoose, { Schema } from "mongoose";

const KeywordSchema = new Schema(
  {
    puesto: {
      type: String,
      required: [true, "Por favor agregue un puesto"],
    },
    keywords: {
      type: [[String, Number]],
    },
    nivel: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    province: {
      type: String,
      required: false,
    },
    industry: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    path: {
      type: String,
    },
    area: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

const Keyword = mongoose.model("Keyword", KeywordSchema);
export default Keyword;
