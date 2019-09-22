// src/max7219-opcodes.js

// # Op codes for the MAX7219.

module.exports = {
  // NO_OP is not set here because it must be 0 for a SPI device to support daisy-chaining.

  // DIGIT_0 ... DIGIT_7: 0x01 ... 0x08

  DECODE_MODE: 0x09, // 0 for none, 1 for digit 0 only, 0
  DECODE_MODE_NONE: 0,
  DECODE_MODE_DIGIT_0: 1,
  DECODE_MODE_LOW: 0x0f,
  DECODE_MODE_ALL: 0xff,

  // Display intensity (brightness); 0 (minimum) ... 0xf.
  INTENSITY: 0x0a,
  INTENSITY_MIN: 0,
  INTENSITY_MAX: 0x0f,

  // Number of digits (7 segment) or rows (matrix); 0 (1 digit)...7 (8 digits).
  SCAN_LIMIT: 0x0b,

  // (Temporarily) shut down the device - it retains all settings and can still be programmed.
  SHUTDOWN: 0x0c,
  SHUTDOWN_MODE: 0,
  SHUTDOWN_NORMAL: 1,

  // Enter test mode (even if shut down).
  DISPLAY_TEST: 0x0f,
  DISPLAY_TEST_OFF: 0,
  DISPLAY_TEST_ON: 1,
};
