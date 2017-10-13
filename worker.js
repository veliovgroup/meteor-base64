;(function() {
  'use strict';
  var _keyArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/', '='];
  var _keyTab = { 0: 52, 1: 53, 2: 54, 3: 55, 4: 56, 5: 57, 6: 58, 7: 59, 8: 60, 9: 61, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25, a: 26, b: 27, c: 28, d: 29, e: 30, f: 31, g: 32, h: 33, i: 34, j: 35, k: 36, l: 37, m: 38, n: 39, o: 40, p: 41, q: 42, r: 43, s: 44, t: 45, u: 46, v: 47, w: 48, x: 49, y: 50, z: 51, '+': 62, '/': 63, '=': 64};
  var fromCharCode = String.fromCharCode;

  var _encode = function (e) {
    var res = '', n, r, i, u, a, f = 0;
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
      res += _keyArr[n >> 2] + _keyArr[(n & 3) << 4 | r >> 4] + _keyArr[u] + _keyArr[a];
    }
    return res;
  };

  var _utf8Encode = function (_e) {
    var e = _e.replace(/\r\n/g, '\n');
    var res = '', n, r;
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
  };

  var _decode = function (e) {
    var res = '', s, o, u, a, f = 0;
    while (f < e.length) {
      s = _keyTab[e.charAt(f++)];
      o = _keyTab[e.charAt(f++)];
      u = _keyTab[e.charAt(f++)];
      a = _keyTab[e.charAt(f++)];
      res += fromCharCode(s << 2 | o >> 4);
      if (u !== 64) {
        res += fromCharCode((o & 15) << 4 | u >> 2);
      }
      if (a !== 64) {
        res += fromCharCode((u & 3) << 6 | a);
      }
    }
    return res;
  };

  var _utf8Decode = function (e) {
    var res = '', n = 0, r = 0;
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
  };

  addEventListener('message', function(e) {
    if (e.data.type === 'encode') {
      postMessage({id: e.data.id, res: _encode(_utf8Encode(e.data.e))});
    } else {
      postMessage({id: e.data.id, res: _utf8Decode(_decode(e.data.e))});
    }
  });
})(this);
