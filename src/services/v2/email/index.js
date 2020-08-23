import sendEmail from "./send-email";
import sendEmails from "./send-emails";

function EmailService() {
  return Object.freeze({
    sendEmail,
    sendEmails,
  });
}

export default EmailService();
