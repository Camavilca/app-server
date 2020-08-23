const template = ({
  fullname = "",
  employmentName,
  companyName,
  url = "https://hcp.hc-planning.com/auth/signup?utm_source=email&utm_medium=recomendarempleo&utm_campaign=selection",
}) => `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Email Invitation HCP</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0 ">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap">
  <style>
    * {
      box-sizing: border-box;
    }
  </style>
</head>

<body style="font-family:Roboto;margin:0;width:100%;max-width:100vw;max-height:100vh;background-color:white;">

  <!--     content -->
  <div style="font-family:Roboto;margin:0;padding:1rem;width:100%;max-height:88vh;overflow-y:scroll;">

    <div style="font-family:Roboto;margin:0;">
      <div
        style="font-family:Roboto;margin:0;text-align:center;margin-bottom:1rem;background:#ededed;border-radius:15px;padding-bottom:0.5rem">
        <img alt="Logo_HCP" height="160px" src="https://i.ibb.co/ns6BNpV/LOGO-SELECTION-COLOR-1.png" />
      </div>
      <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">Hola,</p>
      <span><b>${fullname}</b></span>
      <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">
      Tu perfil profesional se ajusta con el puesto de ${employmentName} que estamos reclutando para la empresa ${companyName}. Ingresa a la oferta y revisa todos los detalles.
      Éxitos.
      </p>
    </div>

    <p style="text-align:center; margin: 2rem 0;">
      <span style="padding:0.5rem 0;box-shadow: 1px 1px 5px 1px">
        <a href=${url}
          style="font-family:Roboto;margin:0;display:inline-block;font-size:1.1rem;padding: 0.5rem 1.5rem;background-color:#ff6501;color:white;text-decoration:none;">
          Aplicar
        </a>
      </span>

    </p>
  </div>

  <!--   footer -->
  <div
    style="background-color:#01205f;position:absolute;bottom:0;left:0;right:0;color:white;line-height:0.6;text-align:center;padding:0.5rem 0;height:12vh">
    <p>Enviado por Human Capital Planing</p>
    <p>San Isidro, Perú</p>
    <p><a style="color:white" href="https://hcp.hc-planning.com">https://hcp.hc-planning.com</a></p>
  </div>
</body>

</html>
`;

export default template;
