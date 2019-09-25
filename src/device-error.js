// ./src/device-error.js

class DeviceError extends Error {
  constructor(message, options) {
    super(message);

    // Set the options.
    const { code, info } = options;
    this.code = code || 'DeviceError';
    this.info = info;

    // Fix the stack trace.
    Error.captureStackTrace(this, DeviceError);
  }
}

module.exports = DeviceError;
