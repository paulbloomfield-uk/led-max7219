// ./src/led-max-7219-error.js

class LedMax7219Error extends Error {
  constructor(message, options) {
    super(message);

    // Set the options.
    const { code, info } = options;
    this.code = code || 'LedMax7219Error';
    this.info = info;

    // Fix the stack trace.
    Error.captureStackTrace(this, LedMax7219Error);
  }
}

module.exports = LedMax7219Error;
