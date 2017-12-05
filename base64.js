import { Meteor } from 'meteor/meteor';

const root = this;
const fromCharCode = String.fromCharCode;

class base64 {
  constructor(opts = {}) {
    this._isNode           = (root.navigator || root.window) ? false : true;
    this._useNative        = (opts.useNative === undefined) ? false : opts.useNative;
    this._allowWebWorker   = (opts.allowWebWorker === undefined) ? true : opts.allowWebWorker;
    this._ejsonCompatible  = (opts.ejsonCompatible === undefined) ? false : opts.ejsonCompatible;
    this._supportWebWorker = false;

    if (this._allowWebWorker) {
      if (!this._isNode) {
        const _URL = root.window.URL || root.window.webkitURL || root.window.mozURL || root.window.msURL || root.window.oURL || false;
        try {
          if (root.window.Worker && root.window.Blob && _URL) {
            this._supportWebWorker = true;
            this._webWorkerUrl = _URL.createObjectURL(new root.window.Blob(["!function(){\"use strict\";var a=[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\",\"O\",\"P\",\"Q\",\"R\",\"S\",\"T\",\"U\",\"V\",\"W\",\"X\",\"Y\",\"Z\",\"a\",\"b\",\"c\",\"d\",\"e\",\"f\",\"g\",\"h\",\"i\",\"j\",\"k\",\"l\",\"m\",\"n\",\"o\",\"p\",\"q\",\"r\",\"s\",\"t\",\"u\",\"v\",\"w\",\"x\",\"y\",\"z\",\"0\",\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"8\",\"9\",\"+\",\"/\",\"=\"],t={0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,\"+\":62,\"/\":63,\"=\":64},e=String.fromCharCode,r=!(!atob||!btoa);addEventListener(\"message\",function(n){\"encode\"===n.data.type?postMessage({id:n.data.id,res:function(t,e){var n=\"\";if(t)if(e&&r)n=btoa(t);else for(var o,d,c,i,f,h=0;h<t.length;)o=t.charCodeAt(h++),i=(15&(d=t.charCodeAt(h++)))<<2|(c=t.charCodeAt(h++))>>6,f=63&c,isNaN(d)?i=f=64:isNaN(c)&&(f=64),n+=a[o>>2]+a[(3&o)<<4|d>>4]+a[i]+a[f];return n}(function(a){var t=\"\";if(a){var r,n,o=a.replace(/\\r\\n/g,\"\\n\");for(r=0;r<o.length;r++)(n=o.charCodeAt(r))<128?t+=e(n):n>127&&n<2048?(t+=e(n>>6|192),t+=e(63&n|128)):(t+=e(n>>12|224),t+=e(n>>6&63|128),t+=e(63&n|128))}return t}(n.data.e),n.data.n)}):postMessage({id:n.data.id,type:\"decode\",res:function(a){var t=\"\";if(a)for(var r=0,n=0;r<a.length;)(n=a.charCodeAt(r))<128?(t+=e(n),r++):n>191&&n<224?(t+=e((31&n)<<6|63&a.charCodeAt(r+1)),r+=2):(t+=e((15&n)<<12|(63&a.charCodeAt(r+1))<<6|63&a.charCodeAt(r+2)),r+=3);return t}(function(a,n){var o=\"\";if(a)if(n&&r)o=atob(a);else for(var d,c,i,f,h=0;h<a.length;)d=t[a.charAt(h++)],c=t[a.charAt(h++)],i=t[a.charAt(h++)],f=t[a.charAt(h++)],o+=e(d<<2|c>>4),64!==i&&(o+=e((15&c)<<4|i>>2)),64!==f&&(o+=e((3&i)<<6|f));return o}(n.data.e,n.data.n))})})}();"], {
              type: 'application/javascript'
            }));
          } else if (root.window.Worker) {
            this._supportWebWorker = true;
            this._webWorkerUrl = Meteor.absoluteUrl('packages/ostrio_base64/worker.min.js');
          } else {
            this._supportWebWorker = false;
          }

          if (this._supportWebWorker) {
            this._worker   = new root.window.Worker(this._webWorkerUrl);
            this._handlers = {};
            this._worker.onmessage = (e) => {
              if (this._handlers[e.data.id]) {
                this._handlers[e.data.id](void 0, ((this._ejsonCompatible && e.data.type === 'decode') ? base64.str2uint8(e.data.res) : e.data.res));
                delete this._handlers[e.data.id];
              }
            };

            this._worker.onerror = (e) => {
              console.error('[ostrio:base64] WebWorker Error', e);
              this._worker.terminate();
              this._handlers = {};
              this._supportWebWorker = false;
            };
          }
        } catch (e) {
          this._supportWebWorker = false;
        }
      }
    }

    if (this._useNative && !this._isNode) {
      this._useNative = !!(root.window.atob && root.window.btoa);
    } else if (this._useNative && this._isNode) {
      this._useNative = true;
    } else {
      this._useNative = false;
      this._isNode    = false;
    }
  }

  get newBinary() {
    return base64.newBinary;
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
        res = String.fromCharCode.apply(null, res);
      }

      if (this._isNode && this._useNative) {
        if (typeof Buffer.from === 'function') {
          res = Buffer.from(res, 'utf8').toString('base64');
        } else {
          res = new Buffer(res, 'utf8').toString('base64');
        }
      } else if (cb && !this._isNode && this._supportWebWorker) {
        const id = base64._getId();
        this._registerHandler(id, cb);
        this._worker.postMessage({type: 'encode', n: this._useNative, id: id, e: res});
        return void 0;
      } else if (this._useNative && !this._isNode) {
        res = root.window.btoa(base64._utf8Encode(res));
      } else {
        res = base64._encode(base64._utf8Encode(res));
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
        res = String.fromCharCode.apply(null, res);
      }

      if (this._isNode && this._useNative) {
        if (typeof Buffer.from === 'function') {
          res = Buffer.from(res, 'base64').toString('utf8');
        } else {
          res = new Buffer(res, 'base64').toString('utf8');
        }
      } else if (cb && !this._isNode && this._supportWebWorker) {
        const id = base64._getId();
        this._registerHandler(id, cb);
        this._worker.postMessage({type: 'decode', n: this._useNative, id: id, e: res});
        return void 0;
      } else if (this._useNative && !this._isNode) {
        res = base64._utf8Decode(root.window.atob(res));
      } else {
        res = base64._utf8Decode(base64._decode(res));
      }
    }

    if (this._ejsonCompatible) {
      res = base64.str2uint8(res);
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
      res += base64._keyArr[n >> 2] + base64._keyArr[(n & 3) << 4 | r >> 4] + base64._keyArr[u] + base64._keyArr[a];
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
      s = base64._keyTab[e.charAt(f++)];
      o = base64._keyTab[e.charAt(f++)];
      u = base64._keyTab[e.charAt(f++)];
      a = base64._keyTab[e.charAt(f++)];
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

  static newUint8Array(len) {
    if (typeof Uint8Array === 'undefined') {
      const ret = [];
      for (let i = 0; i < len; i++) {
        ret.push(0);
      }
      ret.$Uint8ArrayPolyfill = true;
      return ret;
    }
    return new Uint8Array(len);
  }

  static newBinary(len) {
    if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {
      const ret = [];
      for (let i = 0; i < len; i++) {
        ret.push(0);
      }
      ret.$Uint8ArrayPolyfill = true;
      return ret;
    }
    return new Uint8Array(new ArrayBuffer(len));
  }

  static str2uint8(str) {
    const uint = base64.newUint8Array(str.length);

    for(let i = 0; i < str.length; ++i){
      uint[i] = str.charCodeAt(i);
    }
    return uint;
  }

  static _keyArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '='];
  static _keyTab = { 0: 52, 1: 53, 2: 54, 3: 55, 4: 56, 5: 57, 6: 58, 7: 59, 8: 60, 9: 61, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25, a: 26, b: 27, c: 28, d: 29, e: 30, f: 31, g: 32, h: 33, i: 34, j: 35, k: 36, l: 37, m: 38, n: 39, o: 40, p: 41, q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49, y: 50, z: 51, '+': 62, '/': 63, '=': 64};
}

const Base64 = new base64();
export { Base64, base64 };
