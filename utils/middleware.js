const jwt  = require("jsonwebtoken");
const ErrorHandler = require("./ErrorHandler");
const logger = require("./logger");
const config = require("./config");
const { COOKIE_NAME } = require("./constants");

const requestLogger = (req, res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  logger.info("Body:  ", req.body);
  logger.info("---");
  next();
};

const asyncHandler = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch(next);
};
const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const errorMiddleware = (err, req, res, next) => {
  logger.error(err);

  err.statusCode = err.statusCode || 500;
  err.mesage = err.mesage || "Internal Server Error";

  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Json web token is invalid, try again", 400);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Json web token is expired, try again", 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });

};

const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.signedCookies[`${COOKIE_NAME}`];
  const decodedToken = await jwt.verify(token, config.SECRET);
  if (decodedToken) {
    req.decodedToken = decodedToken;
    next();
  } else {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized",
        error: "Invalid token",
      });
  }
});

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorMiddleware,
  verifyToken,
  asyncHandler,
};