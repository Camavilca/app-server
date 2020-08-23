import express from "express";
import helmet from "helmet";
import cors from "cors";
// import routes from "../../api";
import config from "../../config";
import { PRODUCTION } from "./../../constant";
import passportLoader from "./passport";
import sessionOptions from "./session";
import session from "express-session";
import apiRouter from "./../../api";
import { useExpressEstatic, sendIndexHtml } from "./production";
import { notFound, handleError } from "./../../api/middlewares";
import sendNotificationByDayCron from "../../api/routes/v1/scheduled";
import CronService from "./crons";

export default ({ app }) => {
  app.disable("x-powered-by");
  app.use(helmet());

  const whitelist = [config.hostUrl, config.culqiHostUrl];
  const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  if (config.nodeEnv === PRODUCTION) {
    useExpressEstatic(app, config.production.buildPath);
  }

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(session(sessionOptions));
  passportLoader(app);

  app.use("/api", apiRouter);
  sendNotificationByDayCron();
  // CronService.sendRecommendedEmploymentsEmail();

  if (config.nodeEnv === PRODUCTION) {
    sendIndexHtml(app, config.production.buildPath);
  }

  app.use(notFound);
  app.use(handleError);
};
