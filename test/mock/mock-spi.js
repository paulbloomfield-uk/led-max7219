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

  async write(bytes) {
    this.log('write', bytes);
    return bytes.length;
  }
}

module.exports = MockSpi;
