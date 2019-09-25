// ./src/device.js

const { EventEmitter } = require('events');

const DeviceError = require('./device-error');

async function write(conn, data) {
  try {
    return conn.write(data);
  } catch (err) {
    throw new DeviceError(`Error writing to device: ${err.message}`, {
      code: 'DeviceWriteError',
      info: { error: err, data },
    });
  }
}

async function transferOut(conn, data) {
  const message = [{
    byteLength: data.length,
    sendBuffer: Buffer.from(data),
    // This seems to be required for a MAX7219.
    chipSelectChange: true,
  }];

  return new Promise((resolve, reject) => {
    conn.transfer(message, (error, msg) => {
      if (error) {
        reject(new DeviceError(`Error writing to device: ${error.message}`, {
          code: 'DeviceWriteMessageError',
          /* eslint-disable-next-line object-curly-newline */
          info: { error, data, message, conn },
        }));
      } else {
        resolve({ message, msg, byteLength: msg.byteLength });
      }
    });
  });
}

class Device extends EventEmitter {
  constructor() {
    super();
    this.status = {};
  }

  /**
   * Open a connection to the device.
   *
   * @param {*} conn The connection.
   * @emits ready with value `true` on completion.
   */
  async open(conn) {
    if (this.status.isOpen) {
      throw new DeviceError('Device is already open', {
        code: 'DeviceStatusError',
        info: { status: this.status },
      });
    }

    this.conn = conn;

    // Bind the correct version of write.
    if (typeof this.conn !== 'object') {
      this.writeImplementation = null;
    } else if (typeof this.conn.write === 'function') {
      // Recognised a spi-bit-bang connection.
      this.writeImplementation = write;
    } else if (typeof this.conn.transfer === 'function') {
      // Recognised a fivdi/spi-device connection.
      this.writeImplementation = transferOut;
    }
    if (!this.writeImplementation) {
      throw new DeviceError('Invalid connection', {
        code: 'DeviceConnError',
        info: { conn },
      });
    }

    try {
      await this.reset();

      this.status = {
        isOpen: true,
        openedTimestamp: Date.now(),
      };
      this.emit('ready', true);
      return true;
    } catch (error) {
      throw new DeviceError(`Error opening connection to device: ${error.message}`, {
        code: 'DeviceConnError',
        info: { error, conn },
      });
    }
  }

  /**
   * Make all events follow a pattern.
   *
   * @param {String} name  The name of the event.
   * @param {*}      value A value to be emitted.
   */
  emit(name, value) {
    return super.emit(name, value, {
      name,
      value,
      target: this,
      timestamp: Date.now(),
    });
  }

  /**
   * Reset the device.
   *
   * Inheriting classes overriding this method shoud **end** with `return super.reset()` or emit
   * their own reset event.
   *
   * @emits  reset on completion.
   * @return A promise resolved to `true`.
   */
  async reset() {
    this.emit('reset', true);
    return true;
  }

  /**
   * Write bytes to the device.
   *
   * @param  {...Number} data
   */
  async write(...data) {
    try {
      return this.writeImplementation(this.conn, data);
    } catch (error) {
      // Check the device has been opened.
      if (!this.status.isOpen) {
        throw new DeviceError('Open device before writing to it', {
          code: 'DeviceStatusError',
          info: { status: this.status },
        });
      }

      // Something else has gone wrong.
      throw new DeviceError('Error writing to device', {
        code: 'DeviceConnError',
        info: { error, data },
      });
    }
  }
}

module.exports = {
  Device,
  DeviceError,
};
