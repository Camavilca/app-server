export function isAuth(req, res, next) {
  //https://stackoverflow.com/questions/38820251/what-is-req-isauthenticated-passportjs#38820680
  //stackoverflow.com/questions/22052258/what-does-passport-session-middleware-do#28994045
  https: if (req.isAuthenticated()) {
    next();
  }
  return res.json({
    ok: false,
    message: "Inicie sesión nuevamente.",
  });
}
