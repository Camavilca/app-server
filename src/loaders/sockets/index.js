import SocketIO from "socket.io";
import initialData from "./initial-data";
import equalityAddPost from "./equality-add-post";
import readPost from "./read-post";
import readPosts from "./read-posts";

export default (server) => {
  const io = SocketIO().attach(server);

  io.on("connection", function (socket) {
    initialData(socket, io);
    equalityAddPost(socket, io);
    readPost(socket, io);
    readPosts(socket, io);
  });
};
