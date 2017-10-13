import { Meteor } from 'meteor/meteor';

const root = this;
const fromCharCode = String.fromCharCode;

class base64 {
  constructor(allowWebWorker, useNative) {
    this._keyArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '='];
    this._keyTab = { 0: 52, 1: 53, 2: 54, 3: 55, 4: 56, 5: 57, 6: 58, 7: 59, 8: 60, 9: 61, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25, a: 26, b: 27, c: 28, d: 29, e: 30, f: 31, g: 32, h: 33, i: 34, j: 35, k: 36, l: 37, m: 38, n: 39, o: 40, p: 41, q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49, y: 50, z: 51, '+': 62, '/': 63, '=': 64};
    this.isNode            = (root.navigator || root.window) ? false : true;
    this._allowWebWorker   = (allowWebWorker === undefined) ? true : allowWebWorker;
    this._supportWebWorker = false;

    if (this._allowWebWorker) {
      if (!this.isNode) {
        const _URL = root.window.URL || root.window.webkitURL || root.window.mozURL || root.window.msURL || root.window.oURL || false;
        try {
          if (root.window.Worker && root.window.Blob && _URL) {
            this._supportWebWorker = true;
            this._webWorkerUrl = _URL.createObjectURL(new root.window.Blob(["!function(){'use strict';var t=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/','='],r={0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,'+':62,'/':63,'=':64},e=String.fromCharCode,a=function(r){for(var e,a,n,o,c,d='',h=0;h<r.length;)e=r.charCodeAt(h++),o=(15&(a=r.charCodeAt(h++)))<<2|(n=r.charCodeAt(h++))>>6,c=63&n,isNaN(a)?o=c=64:isNaN(n)&&(c=64),d+=t[e>>2]+t[(3&e)<<4|a>>4]+t[o]+t[c];return d},n=function(t){var r,a,n=t.replace(/\\r\\n/g,'\\n'),o='';for(r=0;r<n.length;r++)(a=n.charCodeAt(r))<128?o+=e(a):a>127&&a<2048?(o+=e(a>>6|192),o+=e(63&a|128)):(o+=e(a>>12|224),o+=e(a>>6&63|128),o+=e(63&a|128));return o},o=function(t){for(var a,n,o,c,d='',h=0;h<t.length;)a=r[t.charAt(h++)],n=r[t.charAt(h++)],o=r[t.charAt(h++)],c=r[t.charAt(h++)],d+=e(a<<2|n>>4),64!==o&&(d+=e((15&n)<<4|o>>2)),64!==c&&(d+=e((3&o)<<6|c));return d},c=function(t){for(var r='',a=0,n=0;a<t.length;)(n=t.charCodeAt(a))<128?(r+=e(n),a++):n>191&&n<224?(r+=e((31&n)<<6|63&t.charCodeAt(a+1)),a+=2):(r+=e((15&n)<<12|(63&t.charCodeAt(a+1))<<6|63&t.charCodeAt(a+2)),a+=3);return r};addEventListener('message',function(t){'encode'===t.data.type?postMessage({id:t.data.id,res:a(n(t.data.e))}):postMessage({id:t.data.id,res:c(o(t.data.e))})})}();"], {
              type: 'application/javascript'
            }));
          } else 
          if (root.window.Worker) {
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
                this._handlers[e.data.id](null, e.data.res);
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

    if (useNative && !this.isNode) {
      this.useNative = !!(root.window.atob && root.window.btoa);
    } else if (useNative && this.isNode) {
      this.useNative = true;
    } else {
      this.useNative = false;
      this.isNode    = false;
    }
  }

  _registerHandler(id, cb) {
    this._handlers[id] = cb;
  }

  encode(e, cb) {
    let res = e;
    if (res.length === 0) {
      cb && cb(null, '');
      return '';
    }

    res = String(res);
    if (this.isNode && this.useNative) {
      if (typeof Buffer.from === 'function') {
        return Buffer.from(res, 'utf8').toString('base64');
      }
      return new Buffer(res, 'utf8').toString('base64');
    } else if (this.useNative && !this.isNode) {
      return root.window.btoa(this._utf8Encode(res));
    }

    if (cb && this._supportWebWorker) {
      const id = this._getId();
      this._registerHandler(id, cb);
      this._worker.postMessage({type: 'encode', id: id, e: res});
      return void 0;
    }

    res = this._encode(this._utf8Encode(res));
    if (cb) {
      cb(null, res);
      return void 0;
    }
    return res;
  }

  decode(e, cb) {
    let res = e;
    if (res.length === 0) {
      cb && cb(null, '');
      return '';
    }

    if (this.isNode && this.useNative) {
      if (typeof Buffer.from === 'function') {
        return Buffer.from(res, 'base64').toString('utf8');
      }
      return new Buffer(res, 'base64').toString('utf8');
    } else if (this.useNative && !this.isNode) {
      return this._utf8Decode(root.window.atob(res));
    }

    if (cb && this._supportWebWorker) {
      const id = this._getId();
      this._registerHandler(id, cb);
      this._worker.postMessage({type: 'decode', id: id, e: res});
      return void 0;
    }

    res = this._utf8Decode(this._decode(res));
    if (cb) {
      cb(null, res);
      return void 0;
    }
    return res;
  }

  _encode(e) {
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
      res += this._keyArr[n >> 2] + this._keyArr[(n & 3) << 4 | r >> 4] + this._keyArr[u] + this._keyArr[a];
    }
    return res;
  }

  _utf8Encode(_e) {
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

  _decode(e) {
    let res = '';
    let s;
    let o;
    let u;
    let a;
    let f = 0;
    while (f < e.length) {
      s = this._keyTab[e.charAt(f++)];
      o = this._keyTab[e.charAt(f++)];
      u = this._keyTab[e.charAt(f++)];
      a = this._keyTab[e.charAt(f++)];
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

  _utf8Decode(e) {
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

  _getId() {
    return Math.random().toString(36).slice(2, 18);
  }
}

const Base64 = new base64();
export { Base64, base64 };
