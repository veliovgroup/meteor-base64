# Isomorphic Base64 implementation

Highly efficient isomorphic implementation of Base64 string encoding and decoding. With the support of Unicode, and non-blocking execution via WebWorker. This library has 100% tests coverage, including speed tests.

## Features

  1. [__100%__ tests coverage](https://github.com/VeliovGroup/meteor-base64#100-tests-coverage)
  2. Isomorphic, same API for *Server* and *Browser*
  3. Blazing fast, see [speed tests](https://github.com/VeliovGroup/meteor-base64#100-tests-coverage)
  4. [Non-blocking browser experience](https://github.com/VeliovGroup/meteor-base64#non-blocking-via-webworker), via WebWorkers
  5. [No external dependencies](https://github.com/VeliovGroup/meteor-base64/blob/master/package.js#L9)
  6. Could [replace default Meteor's `base64` package](https://github.com/VeliovGroup/meteor-base64#default-base64-package-replacement)

## Installation

```shell
meteor add ostrio:base64
```

## ES6 Import

```js
import { Base64 } from 'meteor/ostrio:base64';
```

## Native code support

Native code is disabled by default for both NodeJS and browser. Native code represented as `atob, btoa` (*with extension to support Unicode*) in a browser, and `Buffer` at NodeJS.

Although native code is *10x times* faster, its support is disabled, as natively base64 encoding supports only ASCII symbols in a *Browser* and *Node.js*. To enable native code - use constructor in next form:

```js
// Note - first "b" (lowercase)
import { base64 } from 'meteor/ostrio:base64';
const nativeB64 = new base64({ useNative: true });
```

## Non-blocking via WebWorker

WebWorker is enabled by default, for all `encode/decode` calls with the callback. WebWorker is used only if supported by a browser, otherwise, it will fall-back to the main thread. In the real-world application WebWorker, usage will gain you extra FPS, and UI will act more smoothly.

## API

### `.encode()`

```js
Base64.encode(plainString [, callback]);
```

```js
Base64.encode('My Plain String'); // Returns 'TXkgUGxhaW4gU3RyaW5n'

// Async, non-blocking via WebWorker (if supported) at browser:
Base64.encode('My Plain String', (error, b64) => {
  // b64 === 'TXkgUGxhaW4gU3RyaW5n'
});
```

### `.decode()`

```js
Base64.decode(base64EncodedString [, callback]);
```

```js
Base64.decode('TXkgUGxhaW4gU3RyaW5n'); // Returns 'My Plain String'

// Async, non-blocking via WebWorker (if supported) at browser:
Base64.decode('TXkgUGxhaW4gU3RyaW5n', (error, str) => {
  // str === 'My Plain String'
});
```

### Constructor `new base64()`

```js
new base64({ allowWebWorker, useNative, supportNonASCII, ejsonCompatible });
```

  - `opts.allowWebWorker` {*Boolean*} - Default: `true`. Use *WebWorker* in a *Browser* if available;
  - `opts.useNative` {*Boolean*} - Default: `false`. Use native `atob`, `btoa` and `Buffer.from`, if available;
  - `opts.supportNonASCII` {*Boolean*} - Default: `true`. Decreases speed, but gives support for whole utf-8 table;
  - `opts.ejsonCompatible` {*Boolean*} - Default: `false`. Compatible mode with EJSON "binary" format, `.encode()` method will result as *Uint8Array* if `ejsonCompatible` is `true`.

```js
// Note - first "b" (lowercase)
import { base64 } from 'meteor/ostrio:base64';
// Native with WebWorker
const nativeB64 = new base64({ allowWebWorker: true, useNative: true });

// Native without WebWorker
const mtNativeB64 = new base64({ allowWebWorker: false, useNative: true });

// Use main thread, no WebWorker
const mtB64 = new base64({ allowWebWorker: false });
```

## Default `base64` package replacement

  1. Download [`base64-replacement` package](https://github.com/VeliovGroup/meteor-base64-replacement/archive/master.zip) and place into `meteor-app/packages` directory, that's it. Run `meteor update` to make sure new package is applied;
  2. In case of version incompatibility, change [`base64-replacement` version](https://github.com/VeliovGroup/meteor-base64-replacement/blob/master/package.js#L3), to the latest available on the [mainstream channel](https://github.com/meteor/meteor/blob/devel/packages/base64/package.js#L3);
  3. For more info see [`base64-replacement` package](https://github.com/VeliovGroup/meteor-base64-replacement)

## 100% Tests coverage

To run built-in tests clone this repository and run:

```shell
meteor test-packages ./
```

Tests include synchronous, asynchronous and speed tests for Browser and NodeJS, for cases with/out the Native code and/or WebWorker usage.

## Support this project:

This project wouldn't be possible without [ostr.io](https://ostr.io).

Using [ostr.io](https://ostr.io) you are not only [protecting domain names](https://ostr.io/info/domain-names-protection), [monitoring websites and servers](https://ostr.io/info/monitoring), using [Prerendering for better SEO](https://ostr.io/info/prerendering) of your JavaScript website, but support our Open Source activity, and great packages like this one could be available for free.
