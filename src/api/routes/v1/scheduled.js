import schedule from "node-schedule";
import Post from "../../../models/Post";
import User from "../../../models/User";
import config from "../../../config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: config.emailOwner.email,
    pass: config.emailOwner.emailPassword,
  },
});

var rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
// rule.second = 0;

export default () =>
  schedule.scheduleJob(rule, async function () {
    let users = await User.find();
    users.forEach(async (user) => {
      if (user.email) {
        let posts = await Post.find({
          user: user._id,
          createdAt: { $gte: new Date(Date.now() - 86400000) },
        });
        if (posts.length > 0) {
          let html = "<h3>Notificaciones del Dia</h3>";
          for (let i in posts) {
            let e = posts[i];
            html +=
              "<div style='width:80%; background-color:rgba(173, 216, 230, 0.3); padding:25px; margin:15px auto'><p><strong>Usuario:</strong> " +
              e.body +
              "</p><p><strong>Mensaje:</strong> " +
              e.title +
              "</p></div>";
          }
          const mailOptions = {
            to: user.email,
            from: config.emailOwner.email,
            subject: "Notificaciones del dia",
            html: html,
          };
          await transporter.sendMail(mailOptions);
        }
      }
    });
  });
