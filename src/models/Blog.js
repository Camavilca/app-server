import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema({
  day: Schema.Types.Date,
  count: Schema.Types.Number,
});

const BlogSchema = new Schema(
  {
    code: {
      type: Schema.Types.String,
      required: [true, "Código requerido"],
    },
    counterPerDay: {
      type: [CounterSchema],
      default: 0,
    },
    counter: {
      type: Schema.Types.Number,
      default: 0,
    },
    details: {
      type: [
        [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          {
            type: Schema.Types.Date,
            default: new Date(),
          },
        ],
      ],
      default: undefined,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);

export default Blog;
