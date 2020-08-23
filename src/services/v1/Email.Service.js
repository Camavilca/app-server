import nodemailer from "nodemailer";
import config from "../../config";

function createTransporter(crendentials = null) {
  const options = {
    service: "gmail",
    port: 465,
    secure: true,
    auth: crendentials || {
      user: config.emailOwner.email,
      pass: config.emailOwner.emailPassword,
    },
  };
  let transporter = nodemailer.createTransport(options);
  return transporter;
}

export const sendEmail = async (messageObj, crendentials) => {
  try {
    const transporter = createTransporter(crendentials);
    await transporter.sendMail(messageObj);
    return true;
  } catch (error) {
    throw error;
  }
};
