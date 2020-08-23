import sendEmail from "./send-email";

const sendEmails = async (emails, makeTemplate = null, options = {}) => {
  try {
    const sendEmailsPromise = emails.map((email) => {
      let emailObj = emailObjMaker(email, makeTemplate, options.subject || "");
      return sendEmail(emailObj);
    });
    const sendEmails = await Promise.all(sendEmailsPromise);
    const failed = sendEmails.some((e) => e === false);
    if (failed) {
      throw new Error("Failed while sending messages.");
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export default sendEmails;

function emailObjMaker(email = null, makeTemplate, subject) {
  if (!email || !makeTemplate) {
    throw new Error("Email or template maker required.");
  }
  return {
    to: email,
    subject: subject || "",
    html: makeTemplate(),
  };
}
