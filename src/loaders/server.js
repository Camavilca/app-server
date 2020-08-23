import { PRODUCTION } from "../constant";
import config from "./../config";
import http from "http";
import https from "https";
import fs from "fs-extra";

export const createServer = ({ app }) => {
  let server = null;
  switch (config.nodeEnv) {
    case PRODUCTION:
      server = https
        .createServer(
          {
            key: fs.readFileSync(config.production.key),
            cert: fs.readFileSync(config.production.cert),
          },
          app,
          () =>
            console.log(
              `Server start listening at port ${+config.production.portHttps}`
            )
        )
        .listen(+config.production.portHttps);
      return server;
    default:
      server = http.createServer(app);
      return server;
  }
};
