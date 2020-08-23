import config from "./../../config";
import { DEVELOPMENT } from "./../../constant";
export function handleError(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    ok: false,
    message: err.message == null ? err : err.message,
    stack: config.nodeEnv === DEVELOPMENT ? err.stack : "🎲",
  });
}
