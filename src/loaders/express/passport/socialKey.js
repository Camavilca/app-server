import config from "../../../config";

const sucess = config.hostUrl + "/user";
const failure = config.hostUrl + "/auth/login";

export const GOOGLE = {
  clientID:
    "982764434371-ciujhl3ddo15ak9bosbud3e5vb7ih8pu.apps.googleusercontent.com",
  clientSecret: "qcIfR3ehCJksvOdz-G_9s2rX",
  callbackURL: "/api/users/google/callback",
  successRedirect: sucess,
  failureRedirect: failure,
};

export const FACEBOOK = {
  clientID: "175947413819449",
  clientSecret: "bd66bfa88577b60c610d53ef1187af66",
  callbackURL: "/api/users/facebook/callback",
  successRedirect: sucess,
  failureRedirect: failure,
};

export const LINKEDIN = {
  clientID: "787waaq8s1kiob",
  clientSecret: "kDGpzf5Vq5qO2M0x",
  callbackURL: "/api/users/linkedin/callback",
  successRedirect: sucess,
  failureRedirect: failure,
};
