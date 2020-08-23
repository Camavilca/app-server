import User from "../../models/User";
import Post from "../../models/Post";

export default function initialData(socket, _) {
  socket.on("equality_add_post", async ({ userId, title, link, id }) => {
    let foundUser = await User.findById(userId);
    let obj = { body: foundUser.username, title };
    const createAdminUserPosts = async () => {
      let users = await User.find({ role: "AdminUser" });
      if (foundUser.role === "SubUser") {
        let author = await User.findById(foundUser.author);
        users.map(async (e) => {
          await Post.create({
            body: author.username,
            title,
            user: e._id,
            link: "/admin",
          });
        });
      } else {
        users.map(async (e) => {
          await Post.create({
            ...obj,
            user: e._id,
            link: "/admin",
          });
        });
      }
    };
    const createSubUserPosts = async () => {
      let users = await User.find({ role: "SubUser", author: foundUser._id });
      users.map(async (e) => {
        await Post.create({
          ...obj,
          user: e._id,
          link: "/subuser/" + link,
        });
      });
    };
    const createUserPosts = async () => {
      let users = await User.find({ role: "User", _id: foundUser.author });
      users.map(async (e) => {
        await Post.create({
          ...obj,
          user: e._id,
          link: "/equality/" + link,
        });
      });
    };
    const createUserPostFromAdmin = async () => {
      let user = await User.findById(id);
      await Post.create({
        ...obj,
        user: user._id,
        link: "/equality/" + link,
      });
      let subusers = await User.find({ author: user._id });
      if (subusers && subusers.length > 0) {
        subusers.map(async (e) => {
          await Post.create({
            ...obj,
            user: e._id,
            link: "/subuser/" + link,
          });
        });
      }
    };
    const createAdminPostFromAdmin = async () => {
      let users = await User.find({ role: "AdminUser" });
      users.map(async (e) => {
        if (e._id.toString() !== foundUser._id.toString())
          await Post.create({ ...obj, user: e._id, link: "/admin" });
      });
    };
    switch (foundUser.role) {
      case "User":
        createAdminUserPosts();
        createSubUserPosts();
        break;
      case "SubUser":
        createAdminUserPosts();
        createUserPosts();
        break;
      case "AdminUser":
        createUserPostFromAdmin();
        createAdminPostFromAdmin();
        break;
      default:
        break;
    }
  });
}
