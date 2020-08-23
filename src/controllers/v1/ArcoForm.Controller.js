import { sendEmail } from "../../services/v1/Email.Service";
import config from "../../config";
import { PRODUCTION } from "../../constant";

async function sendARCOEmail(req, res) {
  const {
    holderName,
    holderLastname,
    holderTypeDoc,
    holderNumberDoc,
    holderDocumentFile = null,
    holderEmail,
    holderAddress,
    holderPhone,
    representativeName,
    representativeLastname,
    representativeTypeDoc,
    representativeNumberDoc,
    representativeDocumentFile = null,
    representativeAccreditDocumentFile = null,
    requestTypeARCO,
    requestScope,
    requestAditionalFile = null,
  } = req.body;

  let template = `
  <h1>Solicitud ARCO</h1>
  <hr/>
  <h2>Datos personales del titular</h2>
  <div><p><b>Nombres: </b>${holderName} ${holderLastname}</p></div>
  <div><p><b>Tipo y número de DOC: </b>${holderTypeDoc} - ${holderNumberDoc}</p></div>
  <div><p><b>Correo: </b>${holderEmail}</p></div>
  <div><p><b>Direccion y teléfono: </b>${holderAddress} - ${holderPhone}</p></div>
  <hr/>
  <h2>Datos personales del representante del titular</h2>
  <div><p><b>Nombres: </b>${representativeName} ${representativeLastname}</p></div>
  <div><p><b>Tipo ys número de DOC: </b>${representativeTypeDoc} - ${representativeNumberDoc}</p></div>
  <hr/>
  <h2>Tipo de solicitud</h2>
  <div><p><b>Tipo: </b>${requestTypeARCO}</p></div>
  <div><p><b>Alcance de la solicitud: </b>${requestScope}</p></div>
  `;

  let messageOptions = {
    to:
      config.nodeEnv === PRODUCTION
        ? "relacionesempresariales@hc-planning.com"
        : "orlando.camavilca@tecsup.edu.pe",
    subject: "Solicitud ARCO",
    html: template,
  };

  try {
    await sendEmail(messageOptions);
    return res.json({
      ok: true,
      message: "Correo enviado satisfactoriamente a HCP",
    });
  } catch (error) {
    console.log("Error - ", error);
    return res.json({
      ok: false,
      message: "Hubo un error al enviar el correo",
      error: error.message,
      stack: error.stack,
    });
  }
}

export default { sendARCOEmail };
