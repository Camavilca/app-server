import uploadCV from "./upload-cv";

function FileController() {
  return Object.freeze({
    uploadCV,
    downloadReport,
  });
}
export default FileController();

async function downloadReport() {}
