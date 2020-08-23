import R from "r-script";

export function createDashboardHtml(
  trabajadoresPath,
  ponderacionesPath,
  factoresPath,
  logoPath,
  htmlOutputPath
) {
  return new Promise((resolve, reject) => {
    try {
      let dirname = __dirname;
      let out = R(`${dirname}/createDashboard.R`)
        .data({
          trabajadoresPath,
          ponderacionesPath,
          factoresPath,
          logoPath,
          htmlOutputPath,
          dirname,
        })
        .callSync();
      resolve(out);
    } catch (error) {
      let re = /(?<=\+z\+)(.*)(?=\+z\+)/g;
      let stopError = re.exec(error);
      if (stopError && stopError.length > 0) error = stopError[0];
      reject(error);
    }
  });
}
