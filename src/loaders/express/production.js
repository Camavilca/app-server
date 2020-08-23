import express from "express";
import path from "path";

export const useExpressEstatic = (app, pathFile) => {
  let absPath = path.join(__basedir, pathFile);
  app.use(express.static(absPath));
};

export const sendIndexHtml = (app, pathFile) => {
  let absPath = path.join(__basedir, pathFile);
  app.get("*", (_, res) => {
    res.sendFile(absPath + "/index.html");
  });
};
