import Post from "../../models/Post";
export default class NotificationService {
  constructor(req) {
    this.req = req;
  }
}

NotificationService.prototype.markAsRead = async (notificationId) => {
  try {
    const response = await Post.updateOne(
      {
        _id: notificationId,
      },
      { new: true }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

NotificationService.prototype.create = async (userId, title, body, url) => {
  try {
    const response = await Post.create({
      user: userId,
      title,
      body,
      link,
    });
  } catch (error) {
    throw error;
  }
};
