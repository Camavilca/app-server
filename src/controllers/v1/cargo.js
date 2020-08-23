import axios from "axios";
import nodemailer from "nodemailer";
import Cargo from "../../models/Cargo";
import config from "../../config";
import { cargoTemplate } from "./template/EmailTemplate";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: config.emailOwner.email,
    pass: config.emailOwner.emailPassword,
  },
});

export default class CargoClass {
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
}

CargoClass.prototype.getCharges = async function (id) {
  try {
    const charges = Cargo.find({ author: id });
    return charges;
  } catch (error) {
    throw error;
  }
};

CargoClass.prototype.createCharges = function (formData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { amount, email, token_id } = formData;

      var response = await axios.post(
        "https://api.culqi.com/v2/charges",
        {
          amount: amount,
          currency_code: "PEN",
          email: email,
          source_id: token_id,
        },
        this.options
      );

      const { status, statusText, data } = response;

      if (this.checkOk(status)) {
        return resolve({
          ok: true,
          data,
          message:
            (data.outcome && data.outcome.user_message) ||
            "Su compra a sigo exitosa",
        });
      } else {
        return reject(this.err(data, statusText));
      }
    } catch (err) {
      console.log("err", err);
      const message = err.response && err.response.data.merchant_message;
      reject({
        ok: false,
        message: message,
      });
    }
  });
};

CargoClass.prototype.createCargo = function (data) {
  return new Promise(async (resolve, reject) => {
    try {
      const { email = null, token_id = null, testName = null } = data;
      const response = await Cargo.create({
        author: this.req.session.user.userId,
        tokenId: token_id,
        email,
        testName,
      });
      return resolve({ ok: true, data: response });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

CargoClass.prototype.sendEmail = function (data) {
  return new Promise(async (resolve, reject) => {
    try {
      const { email } = data;
      let mailOptions = {
        to: email,
        from: config.emailOwner.email,
        subject: "Correo",
        html: cargoTemplate(data.testName),
      };
      await transporter.sendMail(mailOptions);
      return resolve({ ok: true });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
