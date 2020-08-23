import nodemailer from "nodemailer";
import config from "../../../config";

export default function TransporterFactory(crendentials = null) {
  const options = {
    service: "gmail",
    port: 465,
    secure: true,
    auth: crendentials || {
      user: config.emailOwner.email,
      pass: config.emailOwner.emailPassword,
    },
  };
  return function makeTransporter() {
    let transporter = nodemailer.createTransport(options);
    return transporter;
  };
}
