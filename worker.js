;(function(root) {
  "use strict";
  var ascii   = /^[ -~\t\n\r]+$/;
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var encode  = function (e) {
    var t = "", n, r, i, s, o, u, a, f = 0;
    if (_isUnicode(e)) {
      e = _utf8_encode(e);
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
      t += _keyStr.charAt(s) + _keyStr.charAt(o) + _keyStr.charAt(u) + _keyStr.charAt(a);
    }
    return t;
  };

  var decode = function (e) {
    var t = "", n, r, i, s, o, u, a, f = 0;
    while (f < e.length) {
      s = _keyStr.indexOf(e.charAt(f++));
      o = _keyStr.indexOf(e.charAt(f++));
      u = _keyStr.indexOf(e.charAt(f++));
      a = _keyStr.indexOf(e.charAt(f++));
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
    return _utf8_decode(t);
  };

  var _isUnicode = function (e) {
    return !ascii.test(e);
  };

  var _utf8_encode = function (e) {
    e = e.replace(/\r\n/g, "\n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
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
  };

  var _utf8_decode = function (e) {
    var t = "", n = 0, r = 0, c2 = 0, c3 = 0;
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
  };

  root.onmessage = function(e) {
    if (e.data.op === 'encode') {
      postMessage({id: e.data.id, op: e.data.op, result: encode(e.data.str)});
    } else {
      postMessage({id: e.data.id, op: e.data.op, result: decode(e.data.str)});
    }
  };
}(this));