// test/unit/index.test.js

const LedMax7219 = require('../../src/led-max7219');
const MockSpi = require('../mock/mock-spi');

describe('LedMax7219', () => {
  describe('.open()', () => {
    it('should emit a ready event', (done) => {
      const display = new LedMax7219();
      const spi = new MockSpi();

      expect.assertions(2);

      // Register the event handler first.
      display.once('ready', (ready, event) => {
        expect(event.name).toBe('ready');
        expect(ready).toBe(true);
        done();
      });

      // Now open the connection.
      display.open(spi);
    });

    it('should return a promise resolving to true', async () => {
      const display = new LedMax7219();
      const spi = new MockSpi();

      expect.assertions(1);

      const ready = await display.open(spi);

      expect(ready).toBe(true);
    });

    it('should reject an invalid connection', async () => {
      const display = new LedMax7219();

      expect.assertions(1);

      try {
        await display.open();
      } catch (error) {
        expect(error.code).toBe('DeviceConnError');
      }
    });
  });

  describe('.write()', () => {
    it('should reject with a DeviceStatusError if called before .open()', async () => {
      const display = new LedMax7219();

      expect.assertions(2);

      try {
        await display.write();
      } catch (error) {
        expect(error.code).toBe('DeviceStatusError');
        expect(error.info.status.isOpen).not.toBe(true);
      }
    });
  });
});
