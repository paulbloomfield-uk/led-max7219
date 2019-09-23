// ./src/led-max-7219.js

const { EventEmitter } = require('events');

// Import the op codes for the device.
const opCodes = require('./max7219-opcodes');
const LedMax7219Error = require('./led-max7219-error');

// https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf.

async function write(spi, data) {
  try {
    return spi.write(data);
  } catch (err) {
    throw new LedMax7219Error('Error writing to device', {
      code: 'DeviceWriteError',
      info: { err, data },
    });
  }
}

async function transferOut(spi, data) {
  try {
    return spi.transfer(data);
  } catch (err) {
    throw new LedMax7219Error('Error writing to device using transfer', {
      code: 'DeviceWriteTransferError',
      info: { err, data },
    });
  }
}

class LedMax7219 extends EventEmitter {
  constructor(options) {
    super();

    // Configure this instance.
    this.settings = {
      length: 8,
      decode: false,
      intensity: 3,
      opCodes,
      ...options,
    };
    this.opCodes = this.settings.opCodes;
  }

  async open(spi) {
    this.spi = spi;
    // Bind the correct version of write.
    this.writeImplementation = this.spi.write ? write : transferOut;
    return this.reset();
  }

  async reset() {
    // Blank the display.
    await this.shutdown();

    // Configure all settings.
    await Promise.all([
      this.test(false),
      this.setDecodeMode(this.settings.decode),
      this.setLength(this.settings.length),
      this.setIntensity(this.settings.intensity),
    ]);

    // Clear the display - must wait untill length is set.
    await this.clear();

    // Wake the display up.
    await this.shutdown(false);

    this.emit('ready', true);

    return true;
  }

  async clear() {
    const done = [];
    for (let i = 0; i < this.settings.length; i += 1) {
      done.push(this.setPattern(0, i));
    }
    return Promise.all(done);
  }

  emit(type, value) {
    super.emit(type, value, {
      type,
      value,
      target: this,
      timestamp: Date.now(),
    });
  }

  async setDecodeMode(mode) {
    const m = mode === false
      ? this.opCodes.DECODE_MODE_NONE
      : this.opCodes[`DECODE_MODE_${mode.toUpperCase()}`];
    return this.write([this.opCodes.DECODE_MODE, m]);
  }

  /**
   * Set display intensity (brightness).
   *
   * @param {Number} level Numeric level (0-15).
   * @param {String} level 'max' or 'min'.
   */
  async setIntensity(level) {
    // Parse the argument.
    let levelValue;
    if (typeof level === 'number') {
      if (level === Math.floor(level)) {
        // An integer is a numeric level.
        levelValue = level;
      } else {
        // A relative level.
        const { INTENSITY_MIN, INTENSITY_MAX } = this.opCodes;
        levelValue = Math.round(level * (INTENSITY_MAX - INTENSITY_MIN));
      }
    } else if (typeof level === 'string') {
      levelValue = this.opCodes[`INTENSITY_${level.toUpperCase()}`];
    }

    if (!Number.isInteger(levelValue)) {
      throw new LedMax7219Error('Invalid value passed to setIntensity', {
        code: 'InvalidIntensity',
        info: level,
      });
    }
    return this.write([this.opCodes.INTENSITY, levelValue]);
  }

  async setLength(n) {
    return this.write(this.opCodes.SCAN_LIMIT, n - 1);
  }

  async setPattern(pattern, digit) {
    return this.write(digit + 1, pattern);
  }

  async shutdown(shutdown) {
    const status = shutdown === false ? 1 : 0;
    return this.write(this.opCodes.SHUTDOWN, status);
  }

  async test(on) {
    const status = on === false ? 0 : 1;
    return this.write(this.opCodes.DISPLAY_TEST, status);
  }

  async write(...args) {
    try {
      return this.writeImplementation(this.spi, args);
    } catch (err) {
      throw new LedMax7219Error('Error writing to device', {
        code: 'DeviceWriteError',
        info: { err, args },
      });
    }
  }
}

module.exports = LedMax7219;
