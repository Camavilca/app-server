import TransporterFactory from "./transporter-factory";

const makeTransport = TransporterFactory();

const sendEmail = async (messageObj, crendentials = null) => {
  const transporter = makeTransport(crendentials);
  await transporter.sendMail(messageObj);
  return true;
};

export default sendEmail;
