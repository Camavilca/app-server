import Post from "../../models/Post";

export default function initialData(socket, io) {
  socket.on("initial_data", async ({ userId }) => {
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    io.sockets.emit("get_posts", posts);
  });
}
