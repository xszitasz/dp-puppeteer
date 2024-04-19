class CustomError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.name = this.constructor.name;
    this.exitCode = exitCode;
    Error.captureStackTrace(this, this.constructor);
  }

  exitProcess() {
    process.exit(this.exitCode);
  }
}
  
module.exports = CustomError;
  