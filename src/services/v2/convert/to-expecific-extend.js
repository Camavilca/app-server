import libre from "libreoffice-convert";
import { readFile, writeFileSync, writeFile } from "fs-extra";

const toEspecificExtend = (inputPath, outputPath, { extend = null } = {}) => {
  if (!inputPath || !outputPath) {
    throw new Error("Please insert inputPath and outputPath parameters.");
  }
  return new Promise((resolve, reject) => {
    readFile(inputPath, (err, file) => {
      if (err) {
        reject(`Error reading file: ${err}`);
      }
      libre.convert(file, extend || ".pdf", undefined, (err, done) => {
        if (err) {
          reject(`Error converting file: ${err}`);
        }
        try {
          writeFileSync(outputPath, done);
        } catch (error) {
          reject(error);
        }
        resolve(true);
      });
    });
  });
};

export default toEspecificExtend;
