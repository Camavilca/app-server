import config from "./../config";
import mongooseLoader from "./mongoose";
import expressLoader from "./express";
import sockets from "./sockets";
import { createServer } from "./server";
import { DEVELOPMENT } from "../constant";
import logger from "../log4";

export default async ({ app }) => {
  await mongooseLoader();
  await expressLoader({ app });

  const server = createServer({ app });
  sockets(server);

  if (config.nodeEnv === DEVELOPMENT) {
    server.listen(config.port, () => {
      console.log(`Server start listening at port ${config.port}`);
      logger.info(`\n======================================================\n`);
      logger.info(`Logger: Server start listening at port ${config.port}`);
    });
  }
};
