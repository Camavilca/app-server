import axios from "axios";
import App from "../../models/App";
import nodemailer from "nodemailer";
import AppClass from "../../controllers/v1/apps";
import { sessionizeUser } from "../../util/helpers";
import User from "../../models/User";
import config from "../../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: config.emailOwner.email,
    pass: config.emailOwner.emailPassword,
  },
});

export default class PagoClass {
  constructor(req) {
    this.req = req;
    this.options = {
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + config.culqiPrivate,
      },
    };
  }

  err(data, statusText) {
    return {
      ok: false,
      message: data.user_message || statusText || "Ocurrio un Error inesperado",
    };
  }

  checkOk(status) {
    if (status === 200 || status === 201 || status === 202) return true;
    return false;
  }

  formatClientObj(formData) {
    return {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      address: formData.address,
      // xd: formData.address.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ""),
      address_city: formData.address_city,
      country_code: formData.country_code,
      phone_number: formData.phone_number,
    };
  }

  static checkClientByEmail(email) {
    return (async () => {
      let clients = await axios.get("https://api.culqi.com/v2/customers", {
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + config.culqiPrivate,
        },
      });

      let foundClient =
        clients.data.data && clients.data.data.filter((e) => e.email === email);

      return typeof foundClient === "object" && foundClient.length > 0
        ? foundClient[0]
        : false;
    })();
  }

  async checkCardByClientId(id) {
    let cards = await axios.get("https://api.culqi.com/v2/cards", this.options);
    let foundCard =
      cards.data.data && cards.data.data.filter((e) => e.customer_id === id);

    return typeof foundCard === "object" && foundCard.length > 0
      ? foundCard[0]
      : false;
  }
}

PagoClass.prototype.getClientById = function (id = null) {
  if (id) {
    return new Promise(async (resolve, reject) => {
      try {
        if (id) {
          let client = await axios.get(
            "https://api.culqi.com/v2/customers/" + id,
            this.options
          );

          return resolve({ ok: true, data: client.data });
        }
        return resolve({ ok: true, data: {} });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  }
};

PagoClass.prototype.getSubscriptions = function (idArr = null) {
  if (id) {
    return new Promise(async (resolve, reject) => {
      try {
        let out = [];
        if (idArr) {
          for (var i in idArr) {
            let id = idArr[i];

            let sub = await axios.get(
              "https://api.culqi.com/v2/subscriptions/" + id,
              this.options
            );

            out.push(sub.data);
          }
        }
        return resolve({ ok: true, data: out });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  }
};

PagoClass.prototype.createCard = function (
  customer_id = null,
  token_id = null
) {
  if (customer_id && token_id) {
    return new Promise(async (resolve, reject) => {
      try {
        // const checkCard = await this.checkCardByClientId(customer_id);
        // if (checkCard) {
        // 	return resolve({ ok: true, data: checkCard });
        // }
        var response = await axios.post(
          "https://api.culqi.com/v2/cards",
          {
            customer_id: customer_id,
            token_id: token_id,
          },
          this.options
        );

        const { status, statusText, data } = response;

        if (this.checkOk(status)) {
          return resolve({ ok: true, data });
        } else {
          return reject(this.err(data, statusText));
        }
      } catch (err) {
        const message = err.response && err.response.data.merchant_message;
        return reject({
          ok: false,
          message: message,
        });
      }
    });
  }
};

PagoClass.prototype.createClient = function (formData) {
  return new Promise(async (resolve, reject) => {
    try {
      const clientById = await this.getClientById(
        this.req.session.user.culqiUser
      );
      if (clientById && clientById.ok && clientById.data && clientById.data.id)
        return resolve(clientById);

      const checkClient = await PagoClass.checkClientByEmail(formData.email);

      if (checkClient) {
        let usr = await User.findById(this.req.session.user.userId);
        usr.culqiUser = checkClient.id;
        await usr.save();
        return resolve({ ok: true, data: checkClient });
      }

      const postData = this.formatClientObj(formData);

      let response = await axios.post(
        "https://api.culqi.com/v2/customers",
        postData,
        this.options
      );
      const { status, statusText, data } = response;

      if (this.checkOk(status)) {
        let usr = await User.findById(this.req.session.user.userId);
        usr.culqiUser = data.data.id;
        await usr.save();
        return resolve({ ok: true, data });
      } else {
        return reject(this.err(data, statusText));
      }
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PagoClass.prototype.createSubscription = function (
  card_id = null,
  plan_id = null,
  app = null
) {
  if (card_id && plan_id && app) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await axios.post(
          "https://api.culqi.com/v2/subscriptions",
          { card_id, plan_id, metadata: { app } },
          this.options
        );
        const { status, statusText, data } = response;
        if (this.checkOk(status)) {
          return resolve({ ok: true, data });
        } else {
          return reject(this.err(data, statusText));
        }
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  }
};

PagoClass.prototype.constructSubscription = function (formData) {
  return new Promise(async (resolve, reject) => {
    try {
      let client = await this.createClient(formData);
      let { token_id } = formData;
      let client_id = client.data.id;
      let card = await this.createCard(client_id, token_id);
      let card_id = card.data.id;
      let plan_id = formData.plan_id;
      let app = formData.app;
      let subscription = await this.createSubscription(card_id, plan_id, app);
      if (subscription.ok) {
        return resolve(subscription);
      }
      return reject({ ok: false, message: "Ocurrio un error inesperado" });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PagoClass.prototype.deleteSubscription = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(this.req.session.user.userId).populate({
        path: "apps",
      });
      user.apps = user.apps.filter((e) => e._id.toString() !== id.toString());
      await user.save();

      const sessionUser = sessionizeUser(user);
      this.req.session.user = sessionUser;

      const app = await App.findById(id);
      if (app && app.subscriptionId)
        await axios.delete(
          "https://api.culqi.com/v2/subscriptions/" + app.subscriptionId,
          this.options
        );

      return resolve({
        ok: true,
        user: sessionUser,
      });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PagoClass.prototype.planChange = function (appId, planId, clientId, app) {
  return new Promise(async (resolve, reject) => {
    try {
      const card = await this.checkCardByClientId(clientId);
      const appObj = new AppClass(this.req);
      await this.deleteSubscription(appId);
      const subscription = await this.createSubscription(card.id, planId, app);
      const response = await appObj.createApp(subscription);
      return resolve(response);
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

PagoClass.prototype.sendEmail = function (aplicacion) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = aplicacion && aplicacion.user;
      const app = user && user.apps && user.apps[0];
      const nombre = app.nombre;
      const planName = app.planName;

      const usuario = await User.findById({ _id: user.userId });
      if (!usuario)
        return reject({
          ok: false,
          message: "No existe un usuario con ese correo",
        });

      let mailOptions = {
        to: usuario.email,
        from: config.emailOwner.email,
        subject: "Correo",
        html: `Felicidades! su compra se ha realizado con éxito. Ya puede empezar a disfrutar de Equality.`,
      };

      await transporter.sendMail(mailOptions);
      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
