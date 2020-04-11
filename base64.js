import { Meteor }                from 'meteor/meteor';
import createWebWorkerIfPossible from './worker-create.js';

const _root = this;
const fromCharCode = String.fromCharCode;

class Base64 {
  constructor(opts = {}) {
    this._isNode           = Meteor.isServer; // Save it for NPM release: (_root.navigator || _root.window) ? false : true;
    this._useNative        = (opts.useNative === undefined) ? Meteor.isServer : opts.useNative;
    this._allowWebWorker   = (opts.allowWebWorker === undefined) ? false : opts.allowWebWorker;
    this._ejsonCompatible  = (opts.ejsonCompatible === undefined) ? false : opts.ejsonCompatible;
    this._supportNonASCII  = (opts.supportNonASCII === undefined) ? true : opts.supportNonASCII;
    this._supportWebWorker = false;

    if (this._allowWebWorker) {
      createWebWorkerIfPossible(this, Base64);
    }

    if (this._useNative && !this._isNode) {
      this._useNative = !!(_root.window.atob && _root.window.btoa);
    } else if (this._useNative && this._isNode) {
      this._useNative = true;
    } else {
      this._useNative = false;
      this._isNode    = false;
    }
  }

  get newBinary() {
    return Base64.newBinary;
  }

  _registerHandler(id, cb) {
    this._handlers[id] = cb;
  }

  encode(e, cb) {
    let res = e;
    if (res.length === 0) {
      res = '';
    } else {
      if (this._ejsonCompatible && typeof res !== 'string') {
        res = fromCharCode.apply(null, res);
      }

      if (this._isNode && this._useNative) {
        res = Buffer.from(res, this._supportNonASCII ? 'utf8' : 'ascii').toString('base64');
      } else if (cb && !this._isNode && this._supportWebWorker) {
        const id = Base64._getId();
        this._registerHandler(id, cb);
        this._worker.postMessage({type: 'encode', n: this._useNative, ascii: this._supportNonASCII, id: id, e: res});
        return void 0;
      } else if (this._useNative && !this._isNode) {
        res = _root.window.btoa(this._supportNonASCII ? Base64._utf8Encode(res) : res);
      } else {
        res = Base64._encode(this._supportNonASCII ? Base64._utf8Encode(res) : res);
      }
    }

    if (cb) {
      cb(void 0, res);
      return void 0;
    }
    return res;
  }

  decode(e, cb) {
    let res = e;
    if (res.length === 0) {
      res = '';
    } else {
      if (this._ejsonCompatible && typeof res !== 'string') {
        res = fromCharCode.apply(null, res);
      }

      if (this._isNode && this._useNative) {
        if (typeof Buffer.from === 'function') {
          res = Buffer.from(res, 'base64').toString(this._supportNonASCII ? 'utf8' : 'ascii');
        } else {
          res = new Buffer(res, 'base64').toString(this._supportNonASCII ? 'utf8' : 'ascii');
        }
      } else if (cb && !this._isNode && this._supportWebWorker) {
        const id = Base64._getId();
        this._registerHandler(id, cb);
        this._worker.postMessage({type: 'decode', n: this._useNative, ascii: this._supportNonASCII, id: id, e: res});
        return void 0;
      } else if (this._useNative && !this._isNode) {
        res = this._supportNonASCII ? Base64._utf8Decode(_root.window.atob(res)) : _root.window.atob(res);
      } else {
        res = this._supportNonASCII ? Base64._utf8Decode(Base64._decode(res)) : Base64._decode(res);
      }
    }

    if (this._ejsonCompatible) {
      res = Base64.str2uint8(res);
    }

    if (cb) {
      cb(void 0, res);
      return void 0;
    }
    return res;
  }

  static _encode(e) {
    if (!e) {
      return '';
    }

    let res = '';
    let n;
    let r;
    let i;
    let u;
    let a;
    let f = 0;
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64;
      } else if (isNaN(i)) {
        a = 64;
      }
      res += Base64._keyArr[n >> 2] + Base64._keyArr[(n & 3) << 4 | r >> 4] + Base64._keyArr[u] + Base64._keyArr[a];
    }
    return res;
  }

  static _utf8Encode(_e) {
    if (!_e) {
      return '';
    }

    const e = _e.replace(/\r\n/g, '\n');
    let res = '';
    let n;
    let r;
    for (n = 0; n < e.length; n++) {
      r = e.charCodeAt(n);
      if (r < 128) {
        res += fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        res += fromCharCode(r >> 6 | 192);
        res += fromCharCode(r & 63 | 128);
      } else {
        res += fromCharCode(r >> 12 | 224);
        res += fromCharCode(r >> 6 & 63 | 128);
        res += fromCharCode(r & 63 | 128);
      }
    }
    return res;
  }

  static _decode(e) {
    if (!e) {
      return '';
    }

    let res = '';
    let s;
    let o;
    let u;
    let a;
    let f = 0;
    while (f < e.length) {
      s = Base64._keyTab[e.charAt(f++)];
      o = Base64._keyTab[e.charAt(f++)];
      u = Base64._keyTab[e.charAt(f++)];
      a = Base64._keyTab[e.charAt(f++)];
      res += fromCharCode(s << 2 | o >> 4);
      if (u !== 64) {
        res += fromCharCode((o & 15) << 4 | u >> 2);
      }
      if (a !== 64) {
        res += fromCharCode((u & 3) << 6 | a);
      }
    }
    return res;
  }

  static _utf8Decode(e) {
    if (!e) {
      return '';
    }

    let res = '';
    let n = 0;
    let r = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        res += fromCharCode(r);
        n++;
      } else if (r > 191 && r < 224) {
        res += fromCharCode((r & 31) << 6 | e.charCodeAt(n + 1) & 63);
        n += 2;
      } else {
        res += fromCharCode((r & 15) << 12 | (e.charCodeAt(n + 1) & 63) << 6 | e.charCodeAt(n + 2) & 63);
        n += 3;
      }
    }
    return res;
  }

  static _getId() {
    return Math.random().toString(36).slice(2, 18);
  }

  static uint8Polyfill(len) {
    const ret = [];
    for (let i = 0; i < len; i++) {
      ret.push(0);
    }
    ret.$Uint8ArrayPolyfill = true;
    return ret;
  }

  static newUint8Array(len) {
    if (typeof Uint8Array === 'undefined') {
      return Base64.uint8Polyfill(len);
    }
    return new Uint8Array(len);
  }

  static newBinary(len) {
    if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {
      return Base64.uint8Polyfill(len);
    }
    return new Uint8Array(new ArrayBuffer(len));
  }

  static str2uint8(str) {
    const uint = Base64.newUint8Array(str.length);

    for(let i = 0; i < str.length; ++i){
      uint[i] = str.charCodeAt(i);
    }
    return uint;
  }

  static _keyArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '='];
  static _keyTab = { 0: 52, 1: 53, 2: 54, 3: 55, 4: 56, 5: 57, 6: 58, 7: 59, 8: 60, 9: 61, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25, a: 26, b: 27, c: 28, d: 29, e: 30, f: 31, g: 32, h: 33, i: 34, j: 35, k: 36, l: 37, m: 38, n: 39, o: 40, p: 41, q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49, y: 50, z: 51, '+': 62, '/': 63, '=': 64};
}

export { Base64 };
