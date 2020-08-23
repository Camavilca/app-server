import serverPlotly from "plotly";
import config from "../../../config";
import fs from "fs-extra";
let plotly = null;

function init() {
  plotly = serverPlotly({
    username: config.plotly.user,
    apiKey: config.plotly.key,
    host: "chart-studio.plotly.com",
  });
}

function PlotlyService() {
  init();
  return Object.freeze({
    generateSpiderMap,
  });
}

function createImage(data, folderPath) {
  return new Promise((resolve, reject) => {
    plotly.getImage(
      data,
      { format: "png", width: 800, height: 600 },
      (err, imageStream) => {
        if (err) {
          reject(err);
        }
        let fileStream = fs.createWriteStream(folderPath);
        imageStream.pipe(fileStream);
        fileStream.on("finish", () => {
          resolve(fileStream);
        });
      }
    );
  });
}

async function generateSpiderMap(data, path) {
  try {
    let result = await createImage(data, path);
    console.log(result);

    if (!Boolean(result)) {
      throw new Error("Bad Image generation!");
    }
    return true;
  } catch (err) {
    return false;
  }
}

export default PlotlyService();
