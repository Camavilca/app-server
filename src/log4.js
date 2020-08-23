import log4js from "log4js";

log4js.configure({
  appenders: {
    console: { type: "stdout", layout: { type: "colored" } },
    dateFile: {
      type: "dateFile",
      filename: `logs/app.log`,
      layout: { type: "basic" },
      keepFileExt: true,
    },
  },
  categories: {
    default: {
      appenders: ["console", "dateFile"],
      level: "info",
    },
  },
});

const logger = log4js.getLogger();

export default logger;
