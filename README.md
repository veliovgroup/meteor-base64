Isomorphic Base64 implementation
=====
Isomorphic implementation of Base64 string encoding and decoding. With the support of Unicode, and non-blocking execution via WebWorker. This library has 100% tests coverage, including speed tests.

Installation
=====
```shell
meteor add ostrio:base64
```

ES6 Import
=====
```jsx
import { Base64 } from 'meteor/ostrio:base64';
```

Native code support
=====
Native code is disabled by default for both NodeJS and browser. Native code represented as `atob, btoa` (*with extension to support Unicode*) at a browser, and `Buffer` at NodeJS. Both versions of `new Buffer` via *Constructor* and `Buffer.from` is supported for node >= 7.\*.

Native code support is disabled - as tests indicate up to 3x slower execution than JS-implementation. To run tests - clone this repository and run `meteor test-packages ./`. To enable native code - use constructor in next form:

```jsx
// Note - first "b" (lowercase)
import { base64 } from 'meteor/ostrio:base64';
const nativeB64 = new base64(true, true);
```

Non-blocking via WebWorker
=====
WebWorker is enabled by default, for all `encode/decode` calls with the callback. WebWorker is used only if supported by a browser, otherwise, it will fall-back to the main thread. In the real-world application WebWorker, usage will gain you extra FPS, and UI will act more smoothly.


API
=====
#### `Base64.encode(plainString [, callback])`
```jsx
Base64.encode('My Plain String'); // Returns 'TXkgUGxhaW4gU3RyaW5n'

// Async, non-blocking via WebWorker (if supported) at browser:
Base64.encode('My Plain String', (error, b64) => {
  // b64 === 'TXkgUGxhaW4gU3RyaW5n'
});
```

#### `Base64.decode(base64EncodedString [, callback])`
```jsx
Base64.decode('TXkgUGxhaW4gU3RyaW5n'); // Returns 'My Plain String'

// Async, non-blocking via WebWorker (if supported) at browser:
Base64.decode('TXkgUGxhaW4gU3RyaW5n', (error, str) => {
  // str === 'My Plain String'
});
```

#### Constructor `new base64([allowWebWorker, useNative])`
```jsx
// Note - first "b" (lowercase)
import { base64 } from 'meteor/ostrio:base64';
// Native with WebWorker
const nativeB64 = new base64(true, true);

// Native without WebWorker
const mtNativeB64 = new base64(false, true);

// Use main thread, no WebWorker
const mtB64 = new base64(false);
```


100% Tests coverage
=====
To run built-in tests clone this repository and run:
```shell
meteor test-packages ./
```

Tests include synchronous, asynchronous and speed tests for Browser and NodeJS, for cases with/out the Native code and/or WebWoker usage.