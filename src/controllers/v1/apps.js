import App from "../../models/App";
import User from "../../models/User";
import UserInfo from "../../models/UserInfo";
import { sessionizeUser } from "../../util/helpers";
import config from "../../config";
import axios from "axios";

export default class AppClass {
  constructor(req = null) {
    if (req) this.req = req;
  }

  static checkUserApp(app = null, user = null) {
    return (async () => {
      if (app && user) {
        if (
          typeof user === "object" &&
          user.apps &&
          user.apps.length > 0 &&
          typeof user.apps[0] === "object"
        ) {
          return !user.apps ||
            user.apps.filter((e) => e.nombre === app).length === 0
            ? true
            : false;
        } else if (typeof user === "string") {
          const foundUser = await User.findById(user).populate({
            path: "apps",
          });
          return !foundUser.apps ||
            foundUser.apps.filter((e) => e.nombre === app).length === 0
            ? true
            : false;
        }
        return false;
      }
      return false;
    })();
  }
}

AppClass.prototype.getPlanById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + config.culqiPrivate,
        },
      };
      const response = await axios.get(
        "https://api.culqi.com/v2/plans/" + id,
        options
      );
      return resolve(response.data);
    } catch (err) {
      return reject(err.message);
    }
  });
};

AppClass.prototype.createApp = function (
  subscription = null,
  app_id = null,
  user_id = null
) {
  return new Promise(async (resolve, reject) => {
    try {
      const userId = user_id ? user_id : this.req.session.user.userId;
      const planId = app_id || subscription.data.plan.id;
      const plan = await this.getPlanById(planId);
      if (plan) {
        const planName = plan.name;
        const nombre = plan.metadata.app;
        const subscriptionId = subscription ? subscription.data.id : null;
        const cardId = subscription ? subscription.data.card.id : null;
        const customerId = subscription
          ? subscription.data.card.customer_id
          : null;

        let user = await User.findById(userId).populate({
          path: "apps",
        });

        if (AppClass.checkUserApp(planName, userId)) {
          let app = await App.create({
            user: userId,
            nombre,
            planName,
            subscriptionId,
            cardId,
            customerId,
            planId,
          });

          if (user.apps) user.apps = [...user.apps, app];
          else user.apps = [app];
          await user.save();

          if (subscription) {
            const sessionUser = sessionizeUser(user);
            this.req.session.user = sessionUser;

            return resolve({
              ok: true,
              user: sessionUser,
            });
          } else {
            let userInfo = await UserInfo.findOne({ author: user._id });
            return resolve({
              ok: true,
              user: {
                ...user._doc,
                empresa: userInfo ? userInfo.nombre : user.username,
              },
            });
          }
        } else {
          return reject({
            ok: false,
            message: "La Aplicacion ya existe o No se encuentra el usuario",
          });
        }
      } else {
        return reject({
          ok: false,
          message: "No se encuentra el plan",
        });
      }
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
