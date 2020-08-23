import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las Notificaciones necesita un Autor"]
    },
    title: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    body: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    link: {
      type: String,
      required: [true, "Por favor llene todos los campos"]
    },
    new: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
