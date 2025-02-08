const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream } = require('stream/web');

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
  ReadableStream: { value: ReadableStream },
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id); 