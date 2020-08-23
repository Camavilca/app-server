import UserService from "../../../services/v2/user";
import RecommendationService from "../../../services/v2/recommendation";
import UserInfoService from "../../../services/v2/user-info";
import EmailService from "../../../services/v2/email";
import ChargeService from "../../../services/v2/charge";
import {
  firstRecommendTemplate,
  secondRecommendTemplate,
} from "./email-template";
import { COMPLETE_REPORT } from "../../../constant/selection/postulante/reports/names";
import config from "../../../config";

const unlockReport = async (req, res, next) => {
  try {
    const NUMBER_EMAILS_TO_UNLOCK_REPORT = 5;
    const { data: emails = null, userId = null } = req.body; // Los emails que se reciben no tiene que estar en la base de datos

    if (!emails || !userId) {
      throw new Error("Need emails or userId!");
    }

    if (emails.length < NUMBER_EMAILS_TO_UNLOCK_REPORT) {
      throw new Error(`Please fill ${NUMBER_EMAILS_TO_UNLOCK_REPORT} emails.`);
    }

    const users = await UserService.find();
    let isUserRepetead = false;
    let emailRepeated = null;

    emails.forEach((email) => {
      let someRepeatedUser = users.find((user) => user.email === email);
      if (someRepeatedUser) {
        isUserRepetead = true;
        emailRepeated = someRepeatedUser.email;
      }
    });

    if (isUserRepetead) {
      console.log(`This email "${emailRepeated}" already registered.`);
      throw new Error(`Uno de los correos ya se encuentra registrado`);
    }

    const [user = null] = await UserService.find({ _id: userId });

    const [userInfo = null] = await UserInfoService.findUserSelectionInfo({
      author: userId,
    });

    if (!userInfo) {
      throw new Error("Completa tu perfil, por favor.");
    }

    const fullname = `${userInfo.nombre + " " || ""}${
      userInfo.paterno + " " || ""
    }`;

    // 50% probability to get one template or another
    const randomNumber = Math.random();
    const PROBABILITY = 0.5;
    const templateFactory =
      randomNumber >= PROBABILITY
        ? firstRecommendTemplate.bind(
            null,
            fullname,
            config.invitation.firstTemplateUrl
          )
        : secondRecommendTemplate.bind(
            null,
            fullname,
            config.invitation.secondTemplateUrl
          );

    const sendEmailsResult = await EmailService.sendEmails(
      emails,
      templateFactory,
      {
        subject: `${fullname} te invita a potenciar tu talento con HCP Selection gratis`,
      }
    );

    if (sendEmailsResult) {
      await ChargeService.create({
        author: userId,
        email: user.email,
        testName: COMPLETE_REPORT,
      });
    }

    await UserService.updateById(userId, {
      shouldShowRecommendation: false,
    });

    await RecommendationService.create({
      author: userId,
      type:
        randomNumber >= PROBABILITY
          ? config.invitation.firstNameTemplate
          : config.invitation.secondNameTemplate,
    });

    return res.json({
      ok: true,
      message: "Tu recomendación fue enviada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};

export default unlockReport;
