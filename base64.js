/* jshint node:true */
/* jshint esversion:6 */

const root = this;

export class base64 {
  constructor(allowWebWorker, useNative) {
    this._keyStr           = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    this.isNode            = (root.navigator || root.window) ? false : true;
    this.ascii             = /^[ -~\t\n\r]+$/;
    this._allowWebWorker   = (allowWebWorker === undefined) ? true : allowWebWorker;
    this._supportWebWorker = false;

    if (this._allowWebWorker) {
      if (!this.isNode) {
        var _URL;
        if (root.window.Worker && root.window.Blob) {
          this._supportWebWorker = true;
          _URL = root.window.URL || root.window.webkitURL || root.window.mozURL;
          this._webWorkerUrl = _URL.createObjectURL(new root.window.Blob(['!function(a){"use strict";var b=/^[ -~\\t\\n\\r]+$/,c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",d=function(a){var d,e,h,i,j,k,l,b="",m=0;for(f(a)&&(a=g(a));m<a.length;)d=a.charCodeAt(m++),e=a.charCodeAt(m++),h=a.charCodeAt(m++),i=d>>2,j=(3&d)<<4|e>>4,k=(15&e)<<2|h>>6,l=63&h,isNaN(e)?k=l=64:isNaN(h)&&(l=64),b+=c.charAt(i)+c.charAt(j)+c.charAt(k)+c.charAt(l);return b},e=function(a){for(var d,e,f,g,i,j,k,b="",l=0;l<a.length;)g=c.indexOf(a.charAt(l++)),i=c.indexOf(a.charAt(l++)),j=c.indexOf(a.charAt(l++)),k=c.indexOf(a.charAt(l++)),d=g<<2|i>>4,e=(15&i)<<4|j>>2,f=(3&j)<<6|k,b+=String.fromCharCode(d),64!=j&&(b+=String.fromCharCode(e)),64!=k&&(b+=String.fromCharCode(f));return h(b)},f=function(a){return!b.test(a)},g=function(a){a=a.replace(/\\r\\n/g,"\\n");for(var b="",c=0;c<a.length;c++){var d=a.charCodeAt(c);d<128?b+=String.fromCharCode(d):d>127&&d<2048?(b+=String.fromCharCode(d>>6|192),b+=String.fromCharCode(63&d|128)):(b+=String.fromCharCode(d>>12|224),b+=String.fromCharCode(d>>6&63|128),b+=String.fromCharCode(63&d|128))}return b},h=function(a){for(var b="",c=0,d=0,e=0,f=0;c<a.length;)d=a.charCodeAt(c),d<128?(b+=String.fromCharCode(d),c++):d>191&&d<224?(e=a.charCodeAt(c+1),b+=String.fromCharCode((31&d)<<6|63&e),c+=2):(e=a.charCodeAt(c+1),f=a.charCodeAt(c+2),b+=String.fromCharCode((15&d)<<12|(63&e)<<6|63&f),c+=3);return b};a.onmessage=function(a){var b=a.data.split("|-|");"encode"===b[0]?postMessage(b[1]+"|-|"+d(b[2])):postMessage(b[1]+"|-|"+e(b[2]))}}(this);'], {
            type: 'application/javascript'
          }));
        } else if (root.window.Worker) {
          this._supportWebWorker = true;
          this._webWorkerUrl = Meteor.absoluteUrl('packages/ostrio_base64/worker.min.js');
        } else {
          this._supportWebWorker = false;
        }

        if (this._supportWebWorker) {
          const self     = this;
          this._worker   = new root.window.Worker(this._webWorkerUrl);
          this._handlers = {};
          this._worker.onmessage = function (e) {
            const _data = e.data.split('|-|');
            if (self._handlers[_data[0]]) {
              self._handlers[_data[0]](null, _data[1]);
              delete self._handlers[_data[0]];
            }
          };

          this._worker.onerror = function (e) {
            console.error('[ostrio:base64] WebWorker Error', e);
            self._worker.terminate();
            self._handlers = {};
          };
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
    if (this.isNode && this.useNative) {
      if (typeof Buffer.from === "function") {
        return Buffer.from(e, 'utf8').toString('base64');
      } else {
        return new Buffer(e, 'utf8').toString('base64');
      }
    } else if (this.useNative && !this.isNode) {
      if (this._isUnicode(e)){
        e = this._utf8_encode(e);
      }
      return root.window.btoa(e);
    } else {
      if (cb && this._supportWebWorker) {
        const id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        this._registerHandler(id, cb);
        // this._worker.postMessage({op: 'encode', str: e, id});
        this._worker.postMessage(`encode|-|${id}|-|${e}`);
      } else {
        let t = "";
        let n;
        let r;
        let i;
        let s;
        let o;
        let u;
        let a;
        let f = 0;
        if (this._isUnicode(e)){
          e = this._utf8_encode(e);
        }
        while (f < e.length) {
          n = e.charCodeAt(f++);
          r = e.charCodeAt(f++);
          i = e.charCodeAt(f++);
          s = n >> 2;
          o = (n & 3) << 4 | r >> 4;
          u = (r & 15) << 2 | i >> 6;
          a = i & 63;
          if (isNaN(r)) {
            u = a = 64;
          } else if (isNaN(i)) {
            a = 64;
          }
          t += this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
        }
        if (cb) {
          cb(null, t);
        } else {
          return t;
        }
      }
    }
  }

  decode(e, cb) {
    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    if (this.isNode && this.useNative) {
      if (typeof Buffer.from === "function") {
        return Buffer.from(e, 'base64').toString('utf8');
      } else {
        return new Buffer(e, 'base64').toString('utf8');
      }
    } else if (this.useNative && !this.isNode) {
      return this._utf8_decode(root.window.atob(e));
    } else {
      if (cb && this._supportWebWorker) {
        const id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        this._registerHandler(id, cb);
        this._worker.postMessage(`decode|-|${id}|-|${e}`);
      } else {
        let t = "";
        let n;
        let r;
        let i;
        let s;
        let o;
        let u;
        let a;
        let f = 0;
        while (f < e.length) {
          s = this._keyStr.indexOf(e.charAt(f++));
          o = this._keyStr.indexOf(e.charAt(f++));
          u = this._keyStr.indexOf(e.charAt(f++));
          a = this._keyStr.indexOf(e.charAt(f++));
          n = s << 2 | o >> 4;
          r = (o & 15) << 4 | u >> 2;
          i = (u & 3) << 6 | a;
          t += String.fromCharCode(n);
          if (u != 64) {
            t += String.fromCharCode(r);
          }
          if (a != 64) {
            t += String.fromCharCode(i);
          }
        }
        t = this._utf8_decode(t);
        if (cb) {
          cb(null, t);
        } else {
          return t;
        }
      }
    }
  }

  _isUnicode(e) {
    return !this.ascii.test(e);
  }

  _utf8_encode(e) {
    e = e.replace(/\r\n/g, "\n");
    let t = "";
    for (let n = 0; n < e.length; n++) {
      const r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128);
      } else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128);
      }
    }
    return t;
  }

  _utf8_decode(e) {
    let t = "";
    let n = 0;
    let r = 0;
    let c2 = 0;
    let c3 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++;
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
        n += 2;
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        n += 3;
      }
    }
    return t;
  }
}

const Base64 = new base64();
export {Base64};