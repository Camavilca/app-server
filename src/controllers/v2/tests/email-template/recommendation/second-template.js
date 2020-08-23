// https://codepen.io/ZetaGH/pen/xxwGMja
export const secondRecommendTemplate = (fullname, url) => `
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
      font-family: Roboto;
      font-size: 0.9rem;
    }

    b {
      font-family: Roboto;
      font-size: 0.9rem;
    }
  </style>
</head>

<body
  style="font-family:Roboto;margin:0;width:100%;max-width:100vw;max-height:100vh;background-color:white;height:100vh;background-color=black;position:relative">

  <div
    style="width:100%;max-width:66vw;position:absolute;height:85vh;z-index:1;background-color:white;bottom:0;border-radius:1rem;padding:1rem;margin-left: 1rem;margin-bottom:1rem">
    <!--     content -->
    <div style="font-family:Roboto;margin:0;padding:1rem;width:100%;max-height:88vh;overflow-y:scroll">

      <div style="font-family:Roboto;margin:0;">
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">Hola,</p>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">
          <b><span style="font-family:Roboto;font-size:1.2rem">${fullname}</span></b> te invita a conocer tu <b><span
              style="font-family:Roboto;font-size:1.2rem">perfil psicolaboral de manera gratuita</span></b> a través de
          HCP: Selection.
          Regístrate y obtén un reporte personalizado que te ayudará a prepararte y enfrentar con éxito tus entrevistas
          laborales. Conoce tus resultados de personalidad, razonamiento lógico y comunicación efectiva para que puedas
          trabajar asertivamente en ellos.
        </p>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">

          ¡No te quede atrás! ${fullname} ya dió el primer paso.
        </p>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">

          Haz click <a style="font-size:0.9rem;font-family:Roboto" href="${url}"><span
              style="font-family:Roboto;font-size:1.2rem">aquí</span></a> para acceder a nuestra plataforma.
        </p>
      </div>
      <div style="margin-top:3rem">
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;">Sinceramente,</p>
        <p>
          <img alt="ernesto_tarazona_sign" width="150" src="https://i.ibb.co/MG2g4P0/firma-1.png" />
        </p>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:1rem;line-height:0.5;">Ernesto Tarazona</p>
        <p style="font-family:Roboto;margin:0;font-size:1.2rem;margin-bottom:0rem;line-height:1">Consultant Manager
        </p>
      </div>
      <div style="margin-top:1rem;">
        <img height="33" alt="Logo_HCP" style="margin:0rem 0;" src="https://i.ibb.co/6826WbB/logo-hcp.png" />
      </div>

    </div>

    <!--   footer -->
    <div
      style="background-color:#01205f;position:absolute;bottom:0;left:0;right:0;color:white;line-height:0.6;text-align:center;padding:0.5rem 0;height:12vh;border-radius:0rem 0rem 1rem 1rem">
      <p>Enviado por Human Capital Planing</p>
      <p>San Isidro, Perú</p>
      <p><a style="color:white" href="https://hcp.hc-planning.com">https://hcp.hc-planning.com</a> </p>
    </div>
  </div>

  <img style="position:fixed;top:0;bottom:0;right:0;left:0" alt="BACKGROUND_HCP" width="100%" height="100%"
    src="https://i.ibb.co/bg6QfWm/dibujo1-1.png" />

</body>

</html>
`;
