import Post from "../../models/Post";

export default function initialData(socket, _) {
  socket.on("read_posts", async ({ userId }) => {
    await Post.updateMany(
      {
        user: userId,
      },
      { $set: { new: false } }
    );
  });
}
