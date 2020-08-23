import google from "passport-google-oauth";
import User from "../../../models/User";
import { GOOGLE } from "./socialKey";

const GoogleStrategy = google.OAuth2Strategy;
const configGoogle = {
  clientID: GOOGLE.clientID,
  clientSecret: GOOGLE.clientSecret,
  callbackURL: GOOGLE.callbackURL,
  passReqToCallback: true,
};

export const googleOauth = new GoogleStrategy(
  configGoogle,
  async (req, accessToken, refreshToken, profile, done) => {
    const { id, name, emails } = profile;
    const formData = {
      username: name.givenName,
      email: emails[0].value,
      google: id,
      role: "SelectionUser",
    };
    let usuario = {};
    usuario = await User.findOne({ google: id });

    if (usuario === null) {
      usuario = await User.findOne({ email: emails[0].value });
      if (usuario === null) {
        usuario = await User.create(formData);
        return done(null, usuario, req);
      }
    } else return done(null, usuario, req);
  }
);
