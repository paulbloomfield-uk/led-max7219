// ./src/spi-mock.js

class MockSpi {
  constructor() {
    this.logData = [];
  }

  log(type, data) {
    this.logData.push({
      type,
      data,
      timestamp: Date.now(),
    });
  }

  async transfer(message) {
    this.log('transfer', message);
    const { byteLength, sendBuffer } = message;
    if (message.sendBuffer && (byteLength < sendBuffer.length)) {
      throw new Error('byteLength must be >= sendBuffer.length');
    }
    return sendBuffer && sendBuffer.length;
  }

  async write(bytes) {
    this.log('write', bytes);
    return bytes.length;
  }
}

module.exports = MockSpi;
