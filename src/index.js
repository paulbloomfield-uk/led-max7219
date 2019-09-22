// src/index.js

// Import the op codes for the device.
const opCodes = require('./max7219-opcodes');

// https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf.

class LedMax7219 {
  constructor(spi, options) {
    // Configure this instance.
    this.spi = spi;

    this.settings = {
      length: 8,
      intensity: 3,
      opCodes,
      ...options,
    };
    this.opCodes = this.settings.opCodes;

    // Set up the device.
    this.shutdown(false);
    this.test(false);
    this.setDecodeMode(false);
    this.setLength(this.settings.length);
    this.setIntensity(this.settings.intensity);
    this.clear();
    this.shutdown(false);
  }

  clear() {
    for (let i = 0; i < this.settings.length; i += 1) {
      this.setPattern(0, i);
    }
  }

  setDecodeMode(mode) {
    const m = mode === false
      ? this.opCodes.DECODE_MODE_NONE
      : this.opCodes[`DECODE_MODE_${mode.toUpperCase()}`];
    this.spi.writeSync([this.opCodes.DECODE_MODE, m]);
    return this;
  }

  /**
   * Set display intensity (brightness).
   *
   * @param {Number} level Numeric level (0-15).
   * @param {String} level 'max' or 'min'.
   */
  setIntensity(level) {
    const l = typeof level === 'number' ? level : this.opCodes[`INTENSITY_${level}`];
    this.spi.writeSync([this.opCodes.INTENSITY, l]);
    return this;
  }

  setLength(n) {
    this.spi.writeSync([this.opCodes.SCAN_LIMIT, n - 1]);
    return this;
  }

  setPattern(pattern, digit) {
    this.spi.writeSync([digit + 1, pattern]);
    return this;
  }

  shutdown(shutdown) {
    const status = shutdown === false ? 1 : 0;
    this.spi.writeSync([this.opCodes.SHUTDOWN, status]);
    return this;
  }

  test(on) {
    const status = on === false ? 0 : 1;
    this.spi.writeSync([this.opCodes.DISPLAY_TEST, status]);
    return this;
  }
}

module.exports = LedMax7219;
