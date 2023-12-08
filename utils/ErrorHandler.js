class ErrorHandler extends Error {
  constructor(errorMessage, statusCode) {
    super(errorMessage);
    this.statusCode = statusCode; // 503 if service is down or any other error code for client side errors
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ErrorHandler;