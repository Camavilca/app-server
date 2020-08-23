import { IncomingForm } from "formidable";
import checkType from "./check-type";

const uploadFile = (req, path, { allowedTypes = null, filename = null }) => {
  let pFilename = null;
  let pExt = null;
  let pFullPath = null;

  const form = new IncomingForm();
  form.parse(req);

  return new Promise((resolve, reject) => {
    form
      .on("fileBegin", (_, file) => {
        const fileType = file.type || "";
        const checkResult = checkType(fileType, allowedTypes);
        if (!checkResult) {
          reject("Ingrese el documento en los formatos indicados por favor.");
        }
        if (filename) {
          const [, ext] = file.name.split(".");
          pFilename = `${filename}.${ext}`;
          pExt = ext;
          file.name = pFilename;
        }
        pFullPath = `${path}/${pFilename}`;
        file.path = pFullPath;
      })
      .on("end", () => {
        resolve({ ext: pExt, filename: pFilename, path: pFullPath });
      })
      .once("error", (err) => {
        console.error("error", err);
        reject(err);
      });
  });
};

export default uploadFile;
