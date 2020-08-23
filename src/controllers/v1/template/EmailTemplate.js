export const cargoTemplate = (nombre) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml">
  <head>
    <title>HCP</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0 " />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    />
  </head>
  <body>
    <div
      style="
        width: 550px;
        height: 550px;
        background-image: url(https://img.freepik.com/vector-gratis/fondo-tecnologia_23-2148114753.jpg?size=626&ext=jpg);
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        transition: 0.3s;
      "
    >
      <img
        src="https://static.wixstatic.com/media/99f81a_680b6e8c5cd5436598c203507eb75ad5~mv2.png"
        alt="Avatar"
        style="
          width: 300px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        "
      />
      <div>
        <h1 style="color: white; text-align: center; font-size: 40px;">
          Human Capital Planning
        </h1>
        <h2 style="color: white; text-align: justify; margin: 20px;">
          ¡Felicitaciones! Has adquirido el reporte ${nombre}, donde vas a
          encontrar tu perfil laboral y recomendaciones.
        </h2>
      </div>
    </div>
  </body>
</html>
`;
