import PathService from "../../../services/v2/path";
import FileService from "../../../services/v2/file";
import ConvertService from "../../../services/v2/convert";
import RService from "../../../services/v2/R";
import CvService from "../../../services/v2/cv";
import { PDF, DOCX, DOC } from "../../../constant/typefiles";
// import DocumentsClass from "./../../../controllers/v1/documents";

const curriculumVitae = async (req, res, next) => {
  try {
    const FILENAME = "cv";
    const CURRICULUM = "CURRICULUM";

    // todo: La session y id se manejaran con el middleware
    const userId = req.session.user.userId;
    const cvFolderPath = await PathService.getUserCvPath(userId);

    // req is passed because the file is embedded in the request. req === file
    const { path, filename, ext } = await FileService.upload(
      req,
      cvFolderPath,
      { allowedTypes: [PDF, DOCX, DOC], filename: FILENAME }
    );

    const fileResult = await FileService.upsert({
      path: path,
      name: filename,
      type: CURRICULUM,
      author: userId,
    });

    if (!fileResult) {
      throw new Error("Ocurrió un error al guardar el Archivo.");
    }

    const desireExtend = "pdf";
    let cvFilePath = path;
    let cvPdfFilePath = null;
    if (ext !== desireExtend) {
      let [relativePath] = cvFilePath.split(".");
      cvPdfFilePath = `${relativePath}.${desireExtend}`;
      await ConvertService.toExpecificExtend(cvFilePath, cvPdfFilePath, {
        extend: desireExtend,
      });
    }

    const extractionResult = await RService.extractTextCV(
      cvPdfFilePath ? cvPdfFilePath : cvFilePath
    );

    if (!extractionResult) {
      // Aqui deberia dar una advertencia, en donde diga que se subio correctamente su cv pero que no se podra leer correctamente para puntuarlo. Y debe salir un link de mas información.
      throw new Error(
        "Su archivo se subió correctamente, pero no se calificará en el sistema (Formato ilegible)."
      );
    } else {
      const cv = await CvService.upsert({
        author: userId,
        nombre: extractionResult.nombre,
        correo: extractionResult.correo,
        telefono: extractionResult.telefono,
        grado: extractionResult.grado,
        universidad: extractionResult.universidad,
        words: extractionResult.words,
        goodwords: `${extractionResult.palabras_buenas || 0}`,
      });

      // cv._id es un buffer, por eso se debe poner el toString()
      // Esta funcion de abajo creara los puntajes en la coleccion Puntajes
      await CvService.setScore(cv._id.toString());
    }
    return res.json({
      ok: true,
      message: "Archivo subido exitósamente.",
    });
  } catch (error) {
    next(error);
  }
};

export default curriculumVitae;
