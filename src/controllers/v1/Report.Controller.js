import * as EmailService from "../../services/v1/Email.Service";
import ChargeService from "../../services/v1/Charges.Service";
import { COMPLETE_REPORT } from "../../constant/selection/postulante/reports/names";
import User from "../../models/User";
import UserSelectionInfo from "../../models/UserSelectionInfo";

const template = (fullname, url) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml">
  <head>
    <title>Test Email HCP</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0 ">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap">
    
  </head>
  <body style="font-family:Roboto;margin:0;display:flex;width:100%;min-height:100vh;background-color:white;">
    <p style="font-family:Roboto;margin:0;"/>
    </p>
    <div class="card" style="font-family:Roboto;margin:0;padding:1rem;width:100%;">
      <div class="content" style="font-family:Roboto;margin:0;">
        <div class="title" style="font-family:Roboto;margin:0;display:flex;align-items:center;margin-bottom:3rem;">
          <img width="64px" height="64px" src="https://static.wixstatic.com/media/99f81a_680b6e8c5cd5436598c203507eb75ad5~mv2.png/v1/fill/w_146,h_142,al_c,q_85,usm_0.66_1.00_0.01/png.webp" alt="Logo_HCP" style="font-family:Roboto;margin:0;margin-right:1rem;"/>
              
          <h1 style="font-family:Roboto;margin:0;font-size:1.6rem;">Human Capital Planning</h1>
        </div>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">Hola,</p>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">
          Has sido invitado por ${fullname} a conocer tu perfil psicolaboral de manera gratuita. Regístrate y obtén un reporte personalizado, mismo que incluye resultados de personalidad, razonamiento y comunicación efectiva.
      </p>
      </div>
      <a href="https://hcp.hc-planning.com/auth/signup" style="font-family:Roboto;margin:0;display:inline-block;font-size:1.1rem;">
        Registrarme en HCP de manera gratuita >
          </a>
    </div>
  </body>
</html>
`;

async function sendEmails(emails, fullname) {
  try {
    const promises = emails.map((email) => {
      return EmailService.sendEmail({
        from: "consultoria@hc-planning.com",
        to: email,
        subject: "Invitación HCP",
        html: template(fullname),
      });
    });
    return await Promise.all(promises);
  } catch (error) {
    throw error;
  }
}

async function unlockCompleteReport(req, res) {
  const NUMBER_EMAILS_TO_UNLOCK_REPORT = 5;
  const chargeService = new ChargeService();

  try {
    const emails = req.body.data; // Los emails que se reciben no tiene que estar en la base de datos

    const users = await User.find();
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
      return res.json({
        ok: false,
        message: `El correo ${emailRepeated} ya se encuentra registrado`,
      });
    }

    const userId = req.body.userId;
    //convertir esto en el servicio usuario
    const user = await User.findById(userId);
    const userInfo = await UserSelectionInfo.findOne({ author: userId });
    if (!userInfo) {
      return res.json({
        ok: false,
        message: "Por favor completa tu perfil.",
      });
    }
    const fullname = `${userInfo.nombre + " " || ""}${
      userInfo.paterno + " " || ""
    }${userInfo.materno || ""}`;

    const resultArray = await sendEmails(emails, fullname);
    const emailSentCount = resultArray.filter((v) => v).length;
    if (emailSentCount >= NUMBER_EMAILS_TO_UNLOCK_REPORT) {
      chargeService.create({
        userId,
        email: user.email,
        testName: COMPLETE_REPORT,
      });
    }
    res.json({
      ok: true,
      message: "Correos enviados correctamente!",
    });
  } catch (error) {
    console.log("--------- try ---------", error);
    return res.json({
      ok: false,
      message: "Ocurrio un error al enviar los correos.",
    });
  }
}

export default { unlockCompleteReport };
