# Isomorphic Base64 implementation

<a href="https://www.patreon.com/bePatron?u=20396046">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" height="38">
</a>

<a href="https://ostr.io/info/built-by-developers-for-developers">
  <img src="https://ostr.io/apple-touch-icon-60x60.png" height="38">
</a>

Highly efficient isomorphic implementation of Base64 string encoding and decoding. With the support of Unicode, and non-blocking execution via WebWorker. This library has 100% tests coverage, including speed tests.

## Features

1. [__100%__ tests coverage](https://github.com/VeliovGroup/meteor-base64#100-tests-coverage);
2. Isomorphic, same API for *Server* and *Browser*;
3. Blazing fast, see [speed tests](https://github.com/VeliovGroup/meteor-base64#100-tests-coverage);
4. [Non-blocking browser experience](https://github.com/VeliovGroup/meteor-base64#non-blocking-via-webworker), via WebWorkers;
5. [No external dependencies](https://github.com/VeliovGroup/meteor-base64/blob/master/package.js#L9);
6. Can [replace default Meteor's `base64` package](https://github.com/VeliovGroup/meteor-base64#default-base64-package-replacement).

## Installation

```shell
meteor add ostrio:base64
```

## ES6 Import

```js
import { Base64 } from 'meteor/ostrio:base64';
```

## Native code support

Native code is disabled by default for *Browser*. Native code represented as `atob, btoa` (*with extension to support Unicode*) in a browser, and `Buffer` at NodeJS.

Although native code is *10x times* faster, its support is enabled only on *Server*, as natively base64 encoding supports only ASCII symbols in a *Browser*. To enable native code - pass `{ useNative: true }` in constructor:

```js
import { Base64 } from 'meteor/ostrio:base64';
const nativeB64 = new Base64({ useNative: true });
```

## Non-blocking via WebWorker

WebWorker is __disabled by default__, enable it with passing `{ allowWebWorker: true }` in `new Base64()` constructor. Once enabled it will be used for all `encode/decode` calls with the *callback*. WebWorker is used only if supported by a browser, otherwise, it will fall-back to the main thread. In the real-world application WebWorker, usage will gain you extra FPS, and UI will act more smoothly.

## API

### `.encode()`

```js
base64Instance.encode(plainString [, callback]);
```

```js
import { Base64 } from 'meteor/ostrio:base64';
const base64 = new Base64();

base64.encode('My Plain String'); // Returns 'TXkgUGxhaW4gU3RyaW5n'

// Async, non-blocking via WebWorker (if supported) at browser:
base64.encode('My Plain String', (error, b64) => {
  // b64 === 'TXkgUGxhaW4gU3RyaW5n'
});
```

### `.decode()`

```js
base64Instance.decode(base64EncodedString [, callback]);
```

```js
import { Base64 } from 'meteor/ostrio:base64';
const base64 = new Base64();

base64.decode('TXkgUGxhaW4gU3RyaW5n'); // Returns 'My Plain String'

// Async, non-blocking via WebWorker (if supported) at browser:
base64.decode('TXkgUGxhaW4gU3RyaW5n', (error, str) => {
  // str === 'My Plain String'
});
```

### Constructor `new Base64()`

```js
import { Base64 } from 'meteor/ostrio:base64';
new Base64({ allowWebWorker, useNative, supportNonASCII, ejsonCompatible });
```

- `opts.allowWebWorker` {*Boolean*} - Default: `false`. Use *WebWorker* in a *Browser* if available;
- `opts.useNative` {*Boolean*} - Default in *Browser*: `false`; Default on *Server*: `true`. Use native `atob`, `btoa` and `Buffer.from`, when available;
- `opts.supportNonASCII` {*Boolean*} - Default: `true`. Decreases speed, but gives support for whole utf-8 table;
- `opts.ejsonCompatible` {*Boolean*} - Default: `false`. Compatible mode with EJSON "binary" format, `.encode()` method will result as *Uint8Array* when `ejsonCompatible` is `true`.

```js
import { Base64 } from 'meteor/ostrio:base64';
// Native with WebWorker
const nativeB64 = new Base64({ allowWebWorker: true, useNative: true });

// Native without WebWorker
const mtNativeB64 = new Base64({ allowWebWorker: false, useNative: true });

// Use main thread, no WebWorker
const mtB64 = new Base64({ allowWebWorker: false });
```

## Default `base64` package replacement

1. Download [`base64-replacement` package](https://github.com/VeliovGroup/meteor-base64-replacement/archive/master.zip) and place into `meteor-app/packages` directory, that's it. Run `meteor update` to make sure new package is applied;
2. In case of version incompatibility, change [`base64-replacement` version](https://github.com/VeliovGroup/meteor-base64-replacement/blob/master/package.js#L3), to the latest available on the [mainstream channel](https://github.com/meteor/meteor/blob/devel/packages/base64/package.js#L3);
3. For more info see [`base64-replacement` package](https://github.com/VeliovGroup/meteor-base64-replacement)

## 100% Tests coverage

1. Clone this package
2. In Terminal (*Console*) go to directory where package is cloned
3. Then run:

```shell
# Default
meteor test-packages ./

# With custom port
meteor test-packages ./ --port 8888
```

Tests include synchronous, asynchronous and speed tests for Browser and NodeJS, for cases with/out the Native code and/or WebWorker usage.

## Support this project:

- [Become a patron](https://www.patreon.com/bePatron?u=20396046) — support my open source contributions with monthly donation
- Use [ostr.io](https://ostr.io) — [Monitoring](https://snmp-monitoring.com), [Analytics](https://ostr.io/info/web-analytics), [WebSec](https://domain-protection.info), [Web-CRON](https://web-cron.info) and [Pre-rendering](https://prerendering.com) for a website
