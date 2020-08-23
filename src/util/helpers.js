import { NAME_LIDERAZGOGOLEN } from "../constant/selection/postulante/test/names";
export const sessionizeUser = (user) => {
  return {
    userId: user._id,
    username: user.username,
    email: user.email,
    apps: user.apps,
    role: user.role,
    author: user.author && user.author,
    culqiUser: user.culqiUser && user.culqiUser,
    permissions: user.permissions && user.permissions,
    shoudShowRecommendation: user.shoudShowRecommendation,
  };
};

export const encryptInfo = (userinfo, postulacion, tipoSelection) => {
  const { author } = userinfo;
  let nombre = userinfo.nombre;
  let paterno = userinfo.paterno;
  let materno = userinfo.materno;
  let sexo = userinfo.sexo;
  let departamento = userinfo.departamento;
  let distrito = userinfo.distrito;
  let provincia = userinfo.provincia;
  let email = author.email;
  let edad = dateToAge(userinfo.fecha_nacimiento);
  return {
    author: author._id,
    pretension_salarial: userinfo.pretension_salarial,
    nombre: textToEncrypt(nombre),
    paterno: textToEncrypt(paterno),
    materno: textToEncrypt(materno),
    distrito: textToEncrypt(distrito),
    departamento: textToEncrypt(departamento),
    provincia: textToEncrypt(provincia),
    edad: textToEncrypt(edad),
    sexo: textToEncrypt(sexo),
    email: textToEncrypt(email),
    carrera:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].carrera,
    universidad:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].universidad,
    ciclo_cursado:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].cicloCursando,
    dni: userinfo.dni,
    telefono: userinfo.telefono,
    etapa: postulacion.etapa,
    estado: postulacion.estado,
    puntaje: postulacion.puntaje,
    tipo_proceso: tipoSelection,
    perfil: "/api/upload/incognito",
  };
};

export const regularInfo = (
  userinfo,
  postulacion,
  tipoSelection,
  score = 0
) => {
  const { author } = userinfo;
  return {
    author: author._id,
    pretension_salarial: userinfo.pretension_salarial,
    email: author.email,
    nombre: userinfo.nombre,
    paterno: userinfo.paterno,
    materno: userinfo.materno,
    dni: userinfo.dni,
    telefono: userinfo.telefono,
    carrera:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].carrera,
    universidad:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].universidad,
    ciclo_cursado:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].cicloCursando,
    sexo: userinfo.sexo,
    edad: dateToAge(userinfo.fecha_nacimiento),
    departamento: userinfo.departamento,
    distrito: userinfo.distrito,
    provincia: userinfo.provincia,
    etapa: postulacion.etapa,
    estado: postulacion.estado,
    puntaje: postulacion.puntaje,
    score: score,
    tipo_proceso: tipoSelection,
    perfil: "/api/upload/profile?id=" + author._id,
  };
};

export const regex = (string) => {
  const regex = /^(?=.{6,30}$)(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/gm;
  return regex.test(string);
};

export const sessionizePlanilla = (planilla) => {
  const workers = planilla.workers;
  let arr = { records: [] };
  for (var i in workers) {
    const worker = workers[i];
    arr.records.push({
      value: {
        planilla: worker.planilla,
        codigo: worker.codigo,
        genero: worker.genero,
        cargo: worker.cargo,
        nivel: worker.nivel,
        condicion: worker.condicion,
        ingreso: worker.ingreso,
        sueldo2018: worker.sueldo2018 && worker.sueldo2018,
        sueldo2017: worker.sueldo2017 && worker.sueldo2017,
        sueldo2016: worker.sueldo2016 && worker.sueldo2016,
        bono: worker.bono && worker.bono,
        sueldoBruto: worker.sueldoBruto,
        gratificacion: worker.gratificacion && worker.gratificacion,
        bonoGratificacion: worker.bonoGratificacion && worker.bonoGratificacion,
        cts: worker.cts && worker.cts,
        esalud: worker.esalud && worker.esalud,
        entrenamiento: worker.entrenamiento && worker.entrenamiento,
        laptop: worker.laptop && worker.laptop,
        telefono: worker.telefono && worker.telefono,
        epp: worker.epp && worker.epp,
        ascenso: worker.ascenso && worker.ascenso,
        ultimoAscenso: worker.ultimoAscenso && worker.ultimoAscenso,
        cargoAnterior: worker.cargoAnterior && worker.cargoAnterior,
        puntos: worker.puntos && worker.puntos,
      },
    });
  }
  return arr;
};

const textToEncrypt = (texto) => {
  var chars = {
    a: "B",
    b: "d",
    c: "f",
    d: "4",
    e: "5",
    f: "K",
    g: "d",
    h: "8",
    i: "c",
    j: "10",
    k: "11",
    l: "N",
    m: "13",
    n: "14",
    o: "l",
    p: "15",
    q: "g",
    r: "15",
    s: "1",
    t: "g",
    u: "df",
    v: "df",
    w: "df",
    x: "15",
    y: "s",
    z: "15",
    0: "0",
    1: "r",
    2: "l",
    3: "a",
    4: "Z",
    5: "d",
    6: "0",
    7: "x",
    8: "d",
    9: "v",
  };
  return texto.replace(
    /[abcdfghijklmnopqrstuwxyz0123456789]/g,
    (m) => chars[m]
  );
};

export const dateToAge = (fecha) => {
  var fechaDeNacimiento = new Date(fecha);
  var hoy = new Date();
  return parseInt((hoy - fechaDeNacimiento) / (1000 * 60 * 60 * 24 * 365));
};

const numberToText = (numbers) => {
  let texts = [];
  for (let k = 0; k < numbers.length; k++) {
    texts.push(numbers[k].toString() + " %");
  }
  return texts;
};

export const joinToText = (text) => {
  if (typeof text !== "undefined")
    return text.split(" ").join("").toLocaleLowerCase();
};

export const getBuilImage = (test) => {
  const detalle = test.detalle;
  let color = [];
  let x = [];
  let y = [];
  let title = "";
  let titleyaxis = "";
  let titlexaxis = "";
  let orientation = "v";
  let fixedrangeyaxis = false;
  let fixedrangexaxis = false;
  let rangeyaxis = [];
  let rangexaxis = [];
  let arrText = [];

  if (detalle.length > 0) {
    color = ["#B26223", "#0C4B61", "#11AB93", "#61A40C", "#61A45C", "#61A42C"];
    title = test.tipo;
    orientation = "h";
    fixedrangexaxis = true;
    for (let k = 0; k < detalle.length; k++) {
      y.push(normalize(detalle[k].tipo).toLocaleUpperCase());
      x.push(detalle[k].porcentaje);
    }
    arrText = numberToText(x);
    if (test.tipo === NAME_LIDERAZGOGOLEN) {
      rangexaxis = [0, 10];
    } else {
      rangexaxis = [0, 100];
    }
  } else {
    y = [test.porcentaje];
    x = [test.nivel];
    color = ["#0C4B61"];
    title = test.tipo;
    titleyaxis = "%";
    fixedrangeyaxis = true;
    rangeyaxis = [0, 100];
    arrText = numberToText(y);
  }
  return {
    data: [
      {
        y: y,
        x: x,
        type: "bar",
        orientation: orientation,
        marker: { color: color },
        width: 0.5,
        height: 100,
        text: arrText,
        textposition: "auto",
        hoverinfo: "none",
      },
    ],
    layout: {
      title: title,
      font: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      xaxis: {
        title: titlexaxis,
        fixedrange: fixedrangexaxis,
        range: rangexaxis,
        titlefont: {
          size: 16,
        },
        tickfont: {
          size: 16,
        },
        automargin: true,
      },
      yaxis: {
        title: titleyaxis,
        fixedrange: fixedrangeyaxis,
        range: rangeyaxis,
        titlefont: {
          size: 16,
        },
        tickfont: {
          size: 16,
        },
        zeroline: false,
        automargin: true,
      },
    },
  };
};

export const getSinDetalleImg = (test) => {
  const valor = 100 - test.porcentaje;
  const resto = 100 - valor;
  const colors = [
    "#15DEB5",
    "#0E9EAB",
    "#94E720",
    "#CB8427",
    "#BF6A5E",
    "#BF5E8D",
    "#15DEB5",
    "#55BAA1",
    "#94E720",
    "#15DEB5",
    "#AF7DD9",
    "#94E720",
    "#55BAA1",
  ];
  return {
    data: [
      {
        type: "sunburst",
        labels: [test.nivel, " ", test.porcentaje.toString() + " %"],
        parents: ["", test.nivel, test.nivel],
        values: [100, valor, resto],
        leaf: { opacity: 0.9 },
        marker: { line: { width: 2 } },
        branchvalues: "total",
      },
    ],
    layout: {
      margin: { l: 0, r: 0, b: 0, t: 0 },
      sunburstcolorway: [colors[test.orden], "#35C4C4"],
    },
  };
};

export const normalize = (() => {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping = {};

  for (var i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);

  return (str) => {
    var ret = [];
    for (var i = 0, j = str.length; i < j; i++) {
      var c = str.charAt(i);
      if (mapping.hasOwnProperty(str.charAt(i))) ret.push(mapping[c]);
      else ret.push(c);
    }
    return ret.join("");
  };
})();

const toCapitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const romanize = (num) => {
  let lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

export function getAge(dateString = null) {
  let age = 0;
  var today = new Date();
  var birthDate = new Date(dateString);
  age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const getFullName = (userinfo) => {
  var name = userinfo.nombre ? userinfo.nombre : "";
  var paternal = userinfo.paterno ? userinfo.paterno : "";
  var maternal = userinfo.materno ? userinfo.materno : "";
  return `${name} ${paternal} ${maternal}`;
};

/**UTIL BY DASHBOARD  */
export const defaultInfoPostulation = ({
  userinfo,
  postulation,
  employment,
}) => {
  let scoreDetail = 0;
  return {
    author: userinfo.author._id,
    salaryPretension: userinfo.pretension_salarial,
    email: userinfo.author.email,
    fullName: getFullName(userinfo),
    documentNumber: userinfo.numero_documento,
    documentType: userinfo.tipo_documento,
    workArea: userinfo.area_laboral,
    telephone: userinfo.telefono,
    career:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].carrera,
    university:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].universidad,
    cycleCompleted:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].cicloCursando,
    gender: userinfo.sexo,
    age: dateToAge(userinfo.fecha_nacimiento),
    department: userinfo.departamento,
    district: userinfo.distrito,
    province: userinfo.provincia,
    idEmployment: employment._id,
    selectionTypeEmployment: employment.tipoSelection,
    idPostulation: postulation._id,
    answerPostulation: postulation.preguntas,
    statePostulation: postulation.estado,
    scoreCv: postulation.scoreCv ? Math.round(postulation.scoreCv) : 0,
    stateTest: postulation.stateTest,
    scoreTest: postulation.scoreTest ? Math.round(postulation.scoreTest) : 0,
    qualificationTest: postulation.qualificationTest, // status in react
    stateInterview: postulation.stateInterview,
    listScoreInterview: postulation.scoreInterview,
    scoreInterview: calculateScores(postulation.scoreInterview),
    qualificationInterview: postulation.qualificationInterview,
    stateReference: postulation.stateReference,
    stateReference: postulation.stateReference,
    listScoreReference: postulation.scoreReference,
    scoreReference: calculateScores(postulation.scoreReference),
    qualificationReference: postulation.qualificationReference,
    stateChanges: postulation.stateChanges,
    arrIncompleteTests: postulation.arrIncompleteTests,
    arrCompleteTests: postulation.arrCompleteTests,
    profilePicture: "/api/upload/profile?id=" + userinfo.author._id,
    cvFile: "/api/upload/curriculum?id=" + userinfo.author._id,
    // pruebas
    scoreCvTest: calScoreCvTest({
      scoreCv: postulation.scoreCv,
      scoreTest: postulation.scoreTest,
    }),
    scoreCvTestInterview: calScoreCvTestInterview({
      scoreCv: postulation.scoreCv,
      scoreTest: postulation.scoreTest,
      scoreInterview: calculateScores(postulation.scoreInterview),
    }),
    scoreCvTestInterviewReference: calScoreCvTestInterviewReference({
      scoreCv: postulation.scoreCv,
      scoreTest: postulation.scoreTest,
      scoreInterview: calculateScores(postulation.scoreInterview),
      scoreReference: calculateScores(postulation.scoreReference),
    }),
  };
};

export const encryptonInfoPostulation = ({
  userinfo,
  postulation,
  employment,
}) => {
  return {
    author: userinfo.author._id,
    salaryPretension: userinfo.pretension_salarial,
    email: textToEncrypt(userinfo.author.email),
    fullName: textToEncrypt(getFullName(userinfo)),
    documentNumber: textToEncrypt(userinfo.numero_documento),
    documentType: userinfo.tipo_documento,
    workArea: userinfo.area_laboral,
    telephone: userinfo.telefono,
    career:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].carrera,
    university:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].universidad,
    cycleCompleted:
      userinfo.estudios.length > 0 &&
      userinfo.estudios[0] &&
      userinfo.estudios[0].cicloCursando,
    gender: textToEncrypt(userinfo.sexo),
    age: dateToAge(userinfo.fecha_nacimiento),
    department: textToEncrypt(userinfo.departamento),
    district: textToEncrypt(userinfo.distrito),
    province: textToEncrypt(userinfo.provincia),
    idEmployment: employment._id,
    selectionType: employment.tipoSelection,
    answerPostulation: postulation.preguntas,
    statePostulation: postulation.estado,
    scoreCv: postulation.scoreCv ? postulation.scoreCv : 0,
    stateTest: postulation.stateTest,
    scoreTest: postulation.scoreTest ? postulation.scoreTest : 0,
    qualificationTest: postulation.qualificationTest, // status in react
    stateInterview: postulation.stateInterview,
    scoreInterview: calculateScores(postulation.scoreInterview),
    qualificationInterview: postulation.qualificationInterview,
    stateReference: postulation.stateReference,
    scoreReference: calculateScores(postulation.scoreReference),
    qualificationReference: postulation.qualificationReference,
    stateChanges: postulation.stateChanges,
    arrIncompleteTests: postulation.arrIncompleteTests,
    arrCompleteTests: postulation.arrCompleteTests,
    profilePicture: "/api/upload/profile?id=" + userinfo.author._id,
    cvFile: "/api/upload/curriculum?id=" + userinfo.author._id,
    // pruebas
    scoreCvTest: calScoreCvTest({
      scoreCv: postulation.scoreCv,
      scoreTest: postulation.scoreTest,
    }),
    // scoreCvTestInterview: calScoreCvTestInterview({
    //   scoreCv: postulation.scoreCv,
    //   scoreTest: postulation.scoreTest,
    //   scoreInterview: calculateScores(postulation.scoreInterview),
    // }),
    // scoreCvTestInterviewReference: calScoreCvTestInterviewReference({
    //   scoreCv: postulation.scoreCv,
    //   scoreTest: postulation.scoreTest,
    //   scoreInterview: calculateScores(postulation.scoreInterview),
    //   scoreReference: calculateScores(postulation.scoreReference),
    // }),
  };
};

const calScoreCvTest = ({ scoreCv = 0, scoreTest = 0 }) => {
  let score = (scoreCv + scoreTest) / 2;
  return Math.round(score);
};

const calScoreCvTestInterview = ({
  scoreCv = 0,
  scoreTest = 0,
  scoreInterview = 0,
}) => {
  let score = (scoreCv + scoreTest + scoreInterview * 20) / 3;
  return Math.round(score);
};

const calScoreCvTestInterviewReference = ({
  scoreCv = 0,
  scoreTest = 0,
  scoreInterview = 0,
  scoreReference = 0,
}) => {
  let score =
    (scoreCv + scoreTest + scoreInterview * 20 + scoreReference * 20) / 4;
  return Math.round(score);
};

const calculateScores = (arrScores) => {
  let score = 0;
  if (typeof arrScores !== "undefined" && arrScores.length > 0) {
    let scores = arrScores && arrScores.map((item) => item.score);
    score = scores && scores.reduce((a, b) => a + b, 0);
    score = score / scores.length;
    return score;
  }
  return Math.round(score);
};
