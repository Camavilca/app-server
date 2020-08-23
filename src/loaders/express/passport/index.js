import passport from "passport";
import LocalStrategy from "passport-local";
import User from "./../../../models/User";
import { googleOauth } from "./googleOAuth";

export default (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use("local", new LocalStrategy(User.authenticate()));
  passport.use(googleOauth);
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};
