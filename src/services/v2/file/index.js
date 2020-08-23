import create from "./create";
import upsert from "./upsert";
import upload from "./upload";
import * as Reports from "../reports";

function FileService() {
  return Object.freeze({
    download,
    upload,
    create,
    upsert,
  });
}

export default FileService();

async function download(code) {
  // this just redirect the blod file
}
