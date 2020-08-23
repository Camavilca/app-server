import config from "../../config";
import { PRODUCTION } from "../../constant";
import mongoose from "mongoose";
import expressSession from "express-session";
import connectStore from "connect-mongo";

const MongoStore = connectStore(expressSession);

const TWO_HOURS_MILLISECONDS = 1000 * 60 * 60 * 2;

let sessionOptions = {
  name: config.session.name,
  secret: config.session.secret,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: "session",
    ttl: TWO_HOURS_MILLISECONDS / 1000,
  }),
  cookie: {
    sameSite: true,
    secure: config.nodeEnv === PRODUCTION,
    maxAge: TWO_HOURS_MILLISECONDS,
  },
};

// if (config.nodeEnv !== PRODUCTION) {
//   sessionOptions["cookie"] = {
//     sameSite: true,
//     secure: config.nodeEnv === PRODUCTION,
//     maxAge: TWO_HOURS,
//   };
// }

export default sessionOptions;
