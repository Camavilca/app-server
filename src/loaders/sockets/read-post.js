import Post from "../../models/Post";

export default function initialData(socket, _) {
  socket.on("read_post", async ({ id }) => {
    await Post.updateOne(
      {
        _id: id,
      },
      { $set: { new: false } }
    );
  });
}
