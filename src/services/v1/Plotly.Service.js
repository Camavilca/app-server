import config from "../../config";
import { normalize } from "../../util/helpers";
import {
  NAME_BAP6,
  NAME_BAP7,
  NAME_CAMBIOS,
  NAME_DARTAGNAN,
  NAME_DONATELLO,
  NAME_INTELIGENCIA,
  NAME_LIDERAZGOGOLEN,
  NAME_MOSS,
  NAME_SOCIAL,
  NAME_EMPRENDIMIENTO,
  NAME_ASERTIVIDAD,
} from "../../constant/selection/postulante/test/names";

import Test from "../../models/Test";
import fs from "fs-extra";
import serverPlotly from "plotly";

export default class PlotlyService {
  constructor(req, author) {
    this.req = req;
    this.plotly = serverPlotly({
      username: config.plotly.user,
      apiKey: config.plotly.key,
      host: "chart-studio.plotly.com",
    });
    this.author =
      author || req.params.userId || req.session.user.userId || req.query.id;
    this.sizeImg = { format: "jpeg", width: 600, height: 300 };
    this.fileRoute = __basedir + "/files/";
    this.authorRoute = __basedir + "/files/users/" + this.author;
    this.imgTestRoute = this.authorRoute + "/tests";
    // fs.ensureDirSync(__basedir + "/files/" + author + "/tests");
  }
}

/**
 * @param {Object} asertividad -
 * @param NAME_ASERTIVIDAD
 * @descr Grafica Asertividad
 * indicator => grafica media luna
 */
PlotlyService.prototype.imgAsertividadIN = function (asertividad = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (asertividad === null)
        asertividad = await Test.findOne({
          author: this.author,
          tipo: NAME_ASERTIVIDAD,
        });
      if (asertividad === null || typeof asertividad === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Asertividad",
        });
      const { porcentaje, tipo } = asertividad;
      const data = await this.INDICATOR({ value: porcentaje, title: tipo });
      const directory = this.authorRoute + "/asertividad.jpeg";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};

/**
 * @param {Object} razonamiento -
 * @param NAME_BAP7
 * @descr Grafica Razonamiento
 * indicator => grafica media luna
 */
PlotlyService.prototype.imgRazonamientoIN = function (razonamiento = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (razonamiento === null)
        razonamiento = await Test.findOne({
          author: this.author,
          tipo: NAME_BAP7,
        });
      if (razonamiento === null || typeof razonamiento === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Razonamiento",
        });
      const { porcentaje, tipo } = razonamiento;
      const data = await this.INDICATOR({ value: porcentaje, title: tipo });
      const directory = this.authorRoute + "/razonamiento.png";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};
/**
 * @param {Object} inteligencia -
 * @param NAME_INTELIGENCIA
 * @descr Grafica Inteligencia
 * indicator => grafica media luna
 */
PlotlyService.prototype.imgInteligenciaIN = function (inteligencia = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (inteligencia === null)
        inteligencia = await this.findTest(NAME_INTELIGENCIA);
      if (inteligencia === null || typeof inteligencia === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Inteligencia",
        });
      const { porcentaje, tipo } = inteligencia;
      const data = await this.INDICATOR({ value: porcentaje, title: tipo });
      const directory = this.authorRoute + "/inteligencia.jpeg";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};

/**
 * @param {Object} donatello
 * @param NAME_DONATELLO
 * @descr Grafica Personalidad
 * scatter => grafica lineal Personalidad
 */
PlotlyService.prototype.imgDonatelloScatter = function (donatello = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (donatello === null)
        donatello = await Test.findOne({
          author: this.author,
          tipo: NAME_DONATELLO,
        });
      if (donatello === null || typeof donatello === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Personalidad",
        });
      const { detalle, tipo } = donatello;
      let x = [];
      let y = [];
      let title = tipo;
      let yfixedrange = true;
      let yrange = [0, 100];
      for (let i = 0; i < detalle.length; i++) {
        const item = detalle[i];
        y.push(item.porcentaje);
        x.push(normalize(item.tipo).toLocaleUpperCase());
      }
      const data = await this.BARCHART({
        x,
        y,
        title,
        type: "scatter",
        yfixedrange,
        yrange,
      });
      const directory = this.authorRoute + "/donatello-line.jpeg";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};

/**
 * @param {Object} donatello -
 * @param NAME_DONATELLO
 * @descr Grafica Personalidad
 * BH => barchart y horizontal
 */
PlotlyService.prototype.imgDonatelloBH = function (donatello = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (donatello === null)
        donatello = await Test.findOne({
          author: this.author,
          tipo: NAME_DONATELLO,
        });
      if (donatello === null || typeof donatello === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Personalidad",
        });
      const { detalle, nivel } = donatello;
      let x = [];
      let y = [];
      let orientation = "h";
      let title = nivel;
      let xfixedrange = true;
      let xrange = [0, 100];
      for (let i = 0; i < detalle.length; i++) {
        const item = detalle[i];
        x.push(item.porcentaje);
        y.push(normalize(item.tipo).toLocaleUpperCase());
      }
      const obj = {
        x,
        y,
        orientation,
        title,
        xfixedrange,
        xrange,
      };
      const data = await this.BARCHART(obj);
      const directory = this.authorRoute + "/donatello.jpeg";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};

/**
 * @param {Object} liderazgo -
 * @param NAME_LIDERAZGOGOLEN
 * @descr Grafica Liderazgo Goleman
 * BH => barchart y horizontal
 */
PlotlyService.prototype.imgLiderazgoBH = function (liderazgo = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (liderazgo === null)
        liderazgo = await Test.findOne({
          author: this.author,
          tipo: NAME_LIDERAZGOGOLEN,
        });
      if (liderazgo === null || typeof liderazgo === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Liderazgo",
        });
      const { detalle, nivel } = liderazgo;
      let x = [];
      let y = [];
      let orientation = "h";
      let title = nivel;
      let xfixedrange = true;
      let xrange = [0, 100];
      for (let i = 0; i < detalle.length; i++) {
        const item = detalle[i];
        x.push((item.porcentaje / 12) * 100);
        y.push(normalize(item.tipo).toLocaleUpperCase());
      }
      const obj = {
        x,
        y,
        orientation,
        title,
        xfixedrange,
        xrange,
      };
      const data = await this.BARCHART(obj);
      const directory = this.authorRoute + "/liderazgo.jpeg";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};

/**
 * @param {Object} social -
 * @param NAME_SOCIAL
 * @descr Grafica habilidades sociales
 * BH => barchart y horizontal
 */
PlotlyService.prototype.imgHabilidadSocialBH = function (social = null) {
  return new Promise(async (resolve, reject) => {
    try {
      if (social === null)
        social = await Test.findOne({
          author: this.author,
          tipo: NAME_SOCIAL,
        });
      if (social === null || typeof social === "undefined")
        return reject({
          ok: false,
          message: "Complete la prueba de Habilidades Sociales",
        });
      const { detalle, nivel } = social;
      let x = [];
      let y = [];
      let orientation = "h";
      let title = nivel;
      let xfixedrange = true;
      let xrange = [0, 100];
      for (let i = 0; i < detalle.length; i++) {
        const item = detalle[i];
        x.push(item.porcentaje);
        y.push(normalize(item.tipo).toLocaleUpperCase());
      }
      const obj = {
        x,
        y,
        orientation,
        title,
        xfixedrange,
        xrange,
      };
      const data = await this.BARCHART(obj);
      const directory = this.authorRoute + "/habilidades-sociales.jpeg";
      await this.createImage(data, directory);
      resolve(directory);
    } catch (err) {
      throw err;
    }
  });
};

/**
 * @param {Array} data -
 * @param {string} directory -
 */
PlotlyService.prototype.createImage = function (data, directory) {
  return new Promise(async (resolve, reject) => {
    try {
      this.plotly.getImage(data, this.sizeImg, async (err, imageStream) => {
        if (err)
          return reject({
            ok: false,
            message: "Ocurrio un error al crar el grafico",
          });
        await imageStream.pipe(fs.createWriteStream(directory));
        resolve(true);
      });
    } catch (err) {
      return reject({
        ok: false,
        message: err.message,
      });
    }
  });
};

/**
 * @param {Array} x -
 * @param {Array} y -
 * @param {string} orientation -
 * @param {string} title -
 * @param {string} xtitle -
 * @param {string} ytitle -
 * @param {Boolean} xfixedrange -
 * @param {Boolean} yfixedrange -
 * @param {Array} xrange -
 * @param {Array} yrange -
 */
PlotlyService.prototype.BARCHART = function (obj) {
  const color = [
    "#B26223",
    "#0C4B61",
    "#11AB93",
    "#61A40C",
    "#61A45C",
    "#61A42C",
    "#61A42V",
    "#61A42F",
  ];
  return {
    data: [
      {
        x: obj.x || [],
        y: obj.y || [],
        type: obj.type || "bar",
        orientation: obj.orientation || "v",
        marker: { color: obj.color || color },
        width: 0.5,
        height: 100,
        textposition: "auto",
        hoverinfo: "none",
      },
    ],
    layout: {
      title: obj.title || "",
      font: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      xaxis: {
        title: obj.xtitle || "",
        fixedrange: obj.xfixedrange || false,
        range: obj.xrange || [],
        titlefont: {
          size: 16,
        },
        tickfont: {
          size: 16,
        },
        automargin: true,
      },
      yaxis: {
        title: obj.ytitle || "",
        fixedrange: obj.yfixedrange || false,
        range: obj.yrange || [],
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

/**
 * @param {Number} value -
 * @param {string} title -
 * @param {Array} range -
 * @param {Boolean} visible -
 */
PlotlyService.prototype.INDICATOR = function (obj) {
  var data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: obj.value || 0,
      title: { text: obj.title || "indicator" },
      type: "indicator",
      mode: "gauge+number",
      delta: { reference: 400 },
      gauge: {
        axis: { visible: obj.visible || false, range: obj.range || [0, 100] },
      },
    },
  ];
  return {
    data: data,
    layout: {
      margin: { t: 10, b: 10, l: 10, r: 10 },
    },
  };
};

PlotlyService.prototype.findTest = async function (tipo) {
  return await Test.findOne({ author: this.author, tipo: tipo });
};

PlotlyService.prototype.existTest = function (test) {
  if (test === null || typeof test === "undefined") return false;
  else true;
};

/** IMAGENES PARA TEST REPORT */
/**
 * @param NAME_BAP6
 * @description APTITUD NUMERICA -
 */
PlotlyService.prototype.TEST_BAP6 = async function (test) {
  try {
    // if (test === null)
    //   test = await Test.findOne({ tipo: NAME_BAP6, author: this.author });
    // if (test === null) return { ok: false, message: "salio error" };
    const { porcentaje, tipo, nivel } = test;
    const data = await this.BARCHART({
      x: [nivel],
      y: [porcentaje],
      title: tipo,
      ytitle: "%",
      yfixedrange: true,
      yrange: [0, 100],
    });
    const directory = this.imgTestRoute + "/IMG_BAP6.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_BAP7
 * @description RAZONAMIENTO -
 */
PlotlyService.prototype.TEST_BAP7 = async function (test = null) {
  try {
    if (!test || test === null) test = await Test.findOne({ tipo: NAME_BAP7 });
    const { porcentaje, tipo, nivel } = test;
    const data = await this.BARCHART({
      x: [nivel],
      y: [porcentaje],
      title: tipo,
      yfixedrange: true,
      yrange: [0, 100],
    });
    const directory = this.imgTestRoute + "/IMG_BAP7.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_CAMBIOS
 * @description FLEXIBILIDAD / ADAPTABILIDAD -
 */
PlotlyService.prototype.TEST_CAMBIOS = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_CAMBIOS });
    const { porcentaje, tipo, nivel } = test;
    let x = [nivel];
    let y = [porcentaje];
    let title = tipo;
    let yfixedrange = true;
    let yrange = [0, 100];
    const data = await this.BARCHART({
      x: x,
      y: y,
      title: title,
      yfixedrange: yfixedrange,
      yrange: yrange,
    });
    const directory = this.imgTestRoute + "/IMG_CAMBIOS.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_DARTAGNAN
 * @description INTELIGENCIA -
 */
PlotlyService.prototype.TEST_DARTAGNAN = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_DARTAGNAN, author: this.author });
    const { porcentaje, tipo, nivel } = test;
    let x = [nivel];
    let y = [porcentaje];
    let title = tipo;
    let yfixedrange = true;
    let yrange = [0, 100];
    const data = await this.BARCHART({
      x: x,
      y: y,
      title: title,
      yfixedrange: yfixedrange,
      yrange: yrange,
    });
    const directory = this.imgTestRoute + "/IMG_DARTAGNAN.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_DONATELLO
 * @description PERSONALIDAD -
 */
PlotlyService.prototype.TEST_DONATELLO = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_DONATELLO });
    if (test === null || typeof test === "undefined")
      return { ok: false, message: "Complete el test personalidad" };
    const { detalle, nivel } = test;
    let x = [];
    let y = [];
    let orientation = "h";
    let title = nivel;
    let xfixedrange = true;
    let xrange = [0, 100];
    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      x.push(item.porcentaje);
      y.push(normalize(item.tipo).toLocaleUpperCase());
    }
    const obj = {
      x,
      y,
      orientation,
      title,
      xfixedrange,
      xrange,
    };
    const data = await this.BARCHART(obj);
    const directory = this.imgTestRoute + "/IMG_DONATELLO.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_INTELIGENCIA
 * @description INTELIGENCIA - VB -
 */
PlotlyService.prototype.TEST_INTELIGENCIA = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_INTELIGENCIA });
    const { porcentaje, tipo, nivel } = test;
    let x = [nivel];
    let y = [porcentaje];
    let title = tipo;
    let yfixedrange = true;
    let yrange = [0, 100];
    const data = await this.BARCHART({
      x: x,
      y: y,
      title: title,
      yfixedrange: yfixedrange,
      yrange: yrange,
    });
    const directory = this.imgTestRoute + "/IMG_INTELIGENCIA.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_LIDERAZGOGOLEN
 * @description LIDERAZGO -
 */
PlotlyService.prototype.TEST_LIDERAZGOGOLEN = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_LIDERAZGOGOLEN });
    if (test === null || typeof test === "undefined")
      return { ok: false, message: "Complete el test liderazgo" };
    const { detalle, nivel } = test;
    let x = [];
    let y = [];
    let orientation = "h";
    let title = nivel;
    let xfixedrange = true;
    let xrange = [0, 100];
    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      x.push((item.porcentaje / 12) * 100);
      y.push(normalize(item.tipo).toLocaleUpperCase());
    }
    const obj = {
      x,
      y,
      orientation,
      title,
      xfixedrange,
      xrange,
    };
    const data = await this.BARCHART(obj);
    const directory = this.imgTestRoute + "/IMG_LIDERAZGOGOLEN.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_MOSS
 * @description ADAPTABILIDAD SOCIAL GERENCIAL -
 */
PlotlyService.prototype.TEST_MOSS = async function (test = null) {
  try {
    if (!test || test === null) test = await Test.findOne({ tipo: NAME_MOSS });
    if (test === null || typeof test === "undefined")
      return {
        ok: false,
        message: "Complete el test adaptabilidad sociales gerencial",
      };
    const { detalle, nivel } = test;
    let x = [];
    let y = [];
    let orientation = "h";
    let title = nivel;
    let xfixedrange = true;
    let xrange = [0, 100];
    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      x.push(item.porcentaje);
      y.push(normalize(item.tipo).toLocaleUpperCase());
    }
    const data = await this.BARCHART({
      x,
      y,
      orientation,
      title,
      xfixedrange,
      xrange,
    });
    const directory = this.imgTestRoute + "/IMG_MOSS.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_SOCIAL
 * @description HABILIDADES SOCIALES -
 */
PlotlyService.prototype.TEST_SOCIAL = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_SOCIAL });
    if (test === null || typeof test === "undefined")
      return { ok: false, message: "Complete el test habilidades sociales" };
    const { detalle, nivel } = test;
    let x = [];
    let y = [];
    let orientation = "h";
    let title = nivel;
    let xfixedrange = true;
    let xrange = [0, 100];
    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      x.push(item.porcentaje);
      y.push(normalize(item.tipo).toLocaleUpperCase());
    }
    const data = await this.BARCHART({
      x,
      y,
      orientation,
      title,
      xfixedrange,
      xrange,
    });
    const directory = this.imgTestRoute + "/IMG_SOCIAL.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_EMPRENDIMIENTO
 * @description ACTITUD EMPRENDEDORA -
 */
PlotlyService.prototype.TEST_EMPRENDIMIENTO = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_EMPRENDIMIENTO });
    const { porcentaje, tipo, nivel } = test;
    let x = [nivel];
    let y = [porcentaje];
    let title = tipo;
    let yfixedrange = true;
    let yrange = [0, 100];
    const data = await this.BARCHART({
      x: x,
      y: y,
      title: title,
      yfixedrange: yfixedrange,
      yrange: yrange,
    });
    const directory = this.imgTestRoute + "/IMG_EMPRENDIMIENTO.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};
/**
 * @param NAME_ASERTIVIDAD
 * @description ASERTIVIDAD -
 */
PlotlyService.prototype.TEST_ASERTIVIDAD = async function (test = null) {
  try {
    if (!test || test === null)
      test = await Test.findOne({ tipo: NAME_ASERTIVIDAD });
    const { porcentaje, tipo, nivel } = test;
    let x = [nivel];
    let y = [porcentaje];
    let title = tipo;
    let yfixedrange = true;
    let yrange = [0, 100];
    const data = await this.BARCHART({
      x: x,
      y: y,
      title: title,
      yfixedrange: yfixedrange,
      yrange: yrange,
    });
    const directory = this.imgTestRoute + "/IMG_ASERTIVIDAD.jpeg";
    await this.createImage(data, directory);
    return directory;
  } catch (err) {
    throw err;
  }
};

PlotlyService.prototype.BORRAR = async function () {
  var data = [
    {
      type: "sunburst",
      labels: ["65 %", " ", "Bueno"],
      parents: ["", "65 %", "65 %"],
      values: [100, 100 - 65, 100 - 35],
      leaf: { opacity: 0.4 },
      marker: { line: { width: 2 } },
      branchvalues: "total",
    },
  ];

  var layout = {
    margin: { l: 0, r: 0, b: 0, t: 0 },
  };
  const obj = { data, layout };

  const directory = this.imgTestRoute + "/borrar.jpeg";
  await this.createImage(obj, directory);
};
