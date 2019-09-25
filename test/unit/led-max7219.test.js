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
      display.once('ready', (ready, ev) => {
        expect(ev.type).toBe('ready');
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
  });
});
