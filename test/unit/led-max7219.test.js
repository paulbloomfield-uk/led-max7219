// test/unit/index.test.js

const LedMax7219 = require('../../src/led-max7219');
const MockSpi = require('../mock/mock-spi');

describe('LedMax7219', () => {
  test('Opening a connection should emit a ready event', async () => {
    const display = new LedMax7219();
    const spi = new MockSpi();

    expect.assertions(3);

    display.once('ready', (ready, ev) => {
      expect(ev.type).toBe('ready');
      expect(ready).toBe(true);
    });

    expect(await display.open(spi)).toBe(true);
  });
});
