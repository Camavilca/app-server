import { IncomingForm } from "formidable";
import fs from "fs-extra";
import Keyword from "../../models/Keyword";
import ExcelJs from "exceljs";
import HelperClass from "./helper";

export default class KeywordClass {
  constructor(req) {
    this.req = req;
    this.path = __basedir + "/files/keywords/";
  }
  checkExcelFormat(worksheet) {
    if (
      worksheet &&
      worksheet.getCell("A1").value.toLocaleLowerCase() === "puesto" &&
      worksheet.getCell("A2").value.toLocaleLowerCase() === "palabra clave" &&
      worksheet.getCell("B2").value.toLocaleLowerCase() === "ponderación"
    )
      return true;
    return false;
  }
}

KeywordClass.prototype.uploadKeywordXlsx = function () {
  return new Promise(async (resolve, reject) => {
    try {
      fs.ensureDirSync(this.path);
      let filePath;
      const form = new IncomingForm();

      form
        .on("fileBegin", async (field, file) => {
          if (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" !==
            file.type
          )
            return reject({
              ok: false,
              message: "Por favor solo suba archivos .xlsx",
            });

          file.path = this.path + file.name;
          filePath = file.path;
        })
        .on("end", async () => {
          try {
            let response = await this.createKeywords(filePath);
            return resolve(response);
          } catch (err) {
            return reject({ ok: false, message: err.message });
          }
        });

      form.parse(this.req);
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

KeywordClass.prototype.createKeywords = function (path) {
  return new Promise(async (resolve, reject) => {
    try {
      let workbook = new ExcelJs.Workbook();
      await workbook.xlsx.readFile(path);
      let worksheet = workbook.getWorksheet("Diccionario");

      if (this.checkExcelFormat(worksheet)) {
        const puesto = worksheet.getCell("B1").value;
        let keywords = [];
        worksheet.getColumn("A").eachCell((cell, rowNumber) => {
          if (rowNumber > 2) {
            let value = HelperClass.kwSanitize(cell.value, 2);
            keywords.push([
              value,
              parseInt(worksheet.getCell("B" + rowNumber).value),
            ]);
          }
        });

        let keywordObj = await Keyword.create({
          puesto,
          path,
          keywords,
          type: "MANUAL",
        });
        return resolve({ ok: true, data: keywordObj });
      } else {
        return reject({
          ok: false,
          message: "Por favor suba el formato correcto",
        });
      }
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

KeywordClass.prototype.getKeywords = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const keywords = await Keyword.find();
      return resolve({ ok: true, data: keywords });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

KeywordClass.prototype.updateKeywords = function (formData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, keywords, puesto, country, area, province } = formData;
      const keyword = await Keyword.findById(id);
      if (keyword) {
        if (keywords) keyword.keywords = keywords;
        if (puesto) keyword.puesto = puesto;
        if (country) keyword.country = country;
        if (area) keyword.area = area;
        if (province) keyword.province = province;
        await keyword.save();

        return resolve({ ok: true, data: keyword });
        // const { nivel, category, keywords, id } = formData;
        // const keyword = await Keyword.findById(id);
        // if (keyword) {
        //   if (nivel) keyword.nivel = nivel;
        //   if (category) keyword.category = category;
        //   if (keywords) keyword.keywords = keywords;
        //   await keyword.save();

        //   return resolve({ ok: true, data: keyword });
      } else {
        return reject({ ok: false, message: "No se encuentra el objeto" });
      }
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

KeywordClass.prototype.deleteKeyword = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const keyword = await Keyword.findById(id);
      await keyword.remove();
      return resolve({ ok: true, data: keyword });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
