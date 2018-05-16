import { _ }              from 'meteor/underscore';
import { EJSON }          from 'meteor/ejson';
import { Meteor }         from 'meteor/meteor';
import { Base64, base64 } from 'meteor/ostrio:base64';

const nativeA2B     = new base64({useNative: true, allowWebWorker: false});
const nativeA2BWW   = new base64({useNative: true, allowWebWorker: true});
const jsImpl        = new base64({allowWebWorker: false, useNative: false});
const jsImplBWW     = new base64({allowWebWorker: true, useNative: false});
const meteorASCII   = new base64({allowWebWorker: false, useNative: false, supportNonASCII: false});
const meteorASCIIWW = new base64({allowWebWorker: true, useNative: false, supportNonASCII: false});
const meteorA2B     = new base64({allowWebWorker: false, useNative: false, ejsonCompatible: true, supportNonASCII: false});
const meteorA2BWW   = new base64({allowWebWorker: true, useNative: false, ejsonCompatible: true, supportNonASCII: false});
const timings       = {};
const genStr        = (len) => {
  let result = '';
  const base = 'asdfghjk12345678asdfghjk12345678asdfghjk12345678';
  const iterations = Math.ceil(len / 48);
  for (let i = 0; i < iterations; i++) {
    result += base;
  }
  return result;
};

const strs = {
  str1024: genStr(1024),
  str5120: genStr(5120),
  str10240: genStr(10240),
  str4k: genStr(1024 * 48),
  str20k: genStr(5120 * 48),
  str45k: genStr(10240 * 48)
};

const encoders = {
  // Default_Base64_Class: Base64,
  JavaScript_Implementation_No_WebWorkers: jsImpl,
  JavaScript_Implementation_With_WebWorkers: jsImplBWW,
  Native_Implementation_No_WebWorkers: nativeA2B,
  Native_Implementation_With_WebWorkers: nativeA2BWW,
  'Meteor_compatible_No_WebWorkers [ASCII only]': meteorA2B,
  'Meteor_compatible_With_WebWorkers [ASCII only]': meteorA2BWW,
  'JavaScript_Implementation_No_WebWorkers [ASCII only]': meteorASCII,
  'JavaScript_Implementation_With_WebWorkers [ASCII only]': meteorASCIIWW
};
const encodersKeys = Object.keys(encoders);

const testsStrings = {
  plain: {
    t: 'My Plain String',
    e: 'TXkgUGxhaW4gU3RyaW5n'
  },
  plain_multi_line: {
    t: 'My Plain String\nMy Plain String',
    e: 'TXkgUGxhaW4gU3RyaW5nCk15IFBsYWluIFN0cmluZw=='
  },
  unicode: {
    t: '小飼弾',
    e: '5bCP6aO85by+'
  },
  unicode_multi_line: {
    t: '小飼弾\n小飼弾',
    e: '5bCP6aO85by+CuWwj+mjvOW8vg=='
  },
  cyrillic: {
    t: 'зис из плэйн стринг',
    e: '0LfQuNGBINC40Lcg0L/Qu9GN0LnQvSDRgdGC0YDQuNC90LM='
  },
  cyrillic_multi_line: {
    t: 'зис из плэйн стринг\nзис из плэйн стринг',
    e: '0LfQuNGBINC40Lcg0L/Qu9GN0LnQvSDRgdGC0YDQuNC90LMK0LfQuNGBINC40Lcg0L/Qu9GN0LnQvSDRgdGC0YDQuNC90LM='
  },
  emojis: {
    t: '👨‍💻🤘🧐',
    e: '7aC97bGo4oCN7aC97bK77aC+7bSY7aC+7beQ' // In some cases result equal to '8J+RqOKAjfCfkrvwn6SY8J+nkA=='
  }
};
const testsStringsKeys = Object.keys(testsStrings);

const getTime = function() {
  return (this.window && this.window.performance && this.window.performance.now) ? this.window.performance.now() : +(new Date());
};
const speedtest = (name, func) => {
  const s   = getTime();
  const max = 100;
  let a     = 0;

  while (a < max) {
    func();
    a++;
  }
  const time = parseFloat((getTime() - s).toFixed(5));
  const pad = 15 - `${time}ms`.length;
  console.info(`${time}ms${(() => { return (pad > 0) ? [...Array(pad).keys()].map(() => ' ').join('') : ' '; })()}:- ${name}`);
  return time;
};

const speedtestAsync = (name, func, done) => {
  const s   = getTime();
  const max = 100;
  let a     = 0;

  const run = () => {
    if (a < max) {
      func(++a, max, run);
    } else {
      const time = parseFloat((getTime() - s).toFixed(5));
      const pad = 15 - `${time}ms`.length;
      console.info(`${time}ms${(() => { return (pad > 0) ? [...Array(pad).keys()].map(() => ' ').join('') : ' '; })()}:- ${name}`);
      done(time);
    }
  };
  run();
};

let time;
encodersKeys.forEach((encoderKey) => {
  if (Meteor.isClient || Meteor.isServer && !~encoderKey.indexOf('With_WebWorkers')) {
    Tinytest.add(`Speed Tests - ${encoderKey} - Sync`, function (test) {
      const func = () => encoders[encoderKey].decode(encoders[encoderKey].encode(strs.str4k));
      time = speedtest(`Sync - ${encoderKey}`, func);
      timings['sync-' + encoderKey] = timings['sync-' + encoderKey] || 0;
      timings['sync-' + encoderKey] += time;
      test.isTrue(true);
    });

    Tinytest.addAsync(`Speed Tests - ${encoderKey} - Async`, function (test, next) {
      const func = (curr, max, run) => {
        if (curr < max) {
          encoders[encoderKey].encode(strs.str4k, (err, res) => {
            test.isUndefined(err);
            encoders[encoderKey].decode(res, (error, result) => {
              test.isUndefined(error);
              if (!!~encoderKey.indexOf('Meteor_compatible') && typeof result !== 'string') {
                result = String.fromCharCode.apply(null, result);
              }
              test.isTrue(typeof result === 'string');
              run();
            });
          });
        } else {
          run();
        }
      };

      speedtestAsync(`Async - ${encoderKey}`, func, (timestamp) => {
        timings['async-' + encoderKey] = timings['async-' + encoderKey] || 0;
        timings['async-' + encoderKey] += timestamp;
        next();
      });
    });
  }

  testsStringsKeys.forEach((testKey) => {
    if (!!~encoderKey.indexOf('ASCII only') && !~testKey.indexOf('plain')) {
      return;
    }

    Tinytest.add(`Encode - ${encoderKey} - ${testKey} - Sync`, function (test) {
      const func = () => encoders[encoderKey].encode(testsStrings[testKey].t);
      test.equal(func(), testsStrings[testKey].e);
    });

    Tinytest.add(`Decode - ${encoderKey} - ${testKey} - Sync`, function (test) {
      const func = () => {
        let res = encoders[encoderKey].decode(testsStrings[testKey].e);
        if (!!~encoderKey.indexOf('Meteor_compatible')) {
          res = String.fromCharCode.apply(null, res);
        }
        return res;
      };
      test.equal(func(), testsStrings[testKey].t);
    });

    Tinytest.add(`Decode <-> Encode - ${encoderKey} - ${testKey} - Sync`, function (test) {
      const func = () => {
        let res = encoders[encoderKey].decode(encoders[encoderKey].encode(testsStrings[testKey].t));
        if (!!~encoderKey.indexOf('Meteor_compatible') && typeof res !== 'string') {
          res = String.fromCharCode.apply(null, res);
        }
        return res;
      };
      test.equal(func(), testsStrings[testKey].t);
    });

    Tinytest.addAsync(`Encode - ${encoderKey} - ${testKey} - Async`, function (test, next) {
      encoders[encoderKey].encode(testsStrings[testKey].t, (err, res) => {
        test.isUndefined(err);
        test.equal(res, testsStrings[testKey].e);
        next();
      });
    });

    Tinytest.addAsync(`Decode - ${encoderKey} - ${testKey} - Async`, function (test, next) {
      encoders[encoderKey].decode(testsStrings[testKey].e, (err, res) => {
        test.isUndefined(err);
        if (!!~encoderKey.indexOf('Meteor_compatible') && typeof res !== 'string') {
          res = String.fromCharCode.apply(null, res);
        }
        test.equal(res, testsStrings[testKey].t);
        next();
      });
    });

    Tinytest.addAsync(`Decode <-> Encode - ${encoderKey} - ${testKey} - Async`, function (test, next) {
      encoders[encoderKey].encode(testsStrings[testKey].t, (err, res) => {
        test.isUndefined(err);
        if (!~encoderKey.indexOf('Meteor_compatible') && typeof res !== 'string') {
          res = String.fromCharCode.apply(null, res);
        }
        test.equal(res, testsStrings[testKey].e);
        encoders[encoderKey].decode(res, (error, result) => {
          test.isUndefined(error);
          if (!!~encoderKey.indexOf('Meteor_compatible') && typeof result !== 'string') {
            result = String.fromCharCode.apply(null, result);
          }
          test.equal(result, testsStrings[testKey].t);
          next();
        });
      });
    });
  });
});

/*
 * @description TESTS BY MDG
 * @link https://github.com/meteor/meteor/blob/8a8df1f89db28ee77074aa851a50d4800ce9e61a/packages/base64/base64_test.js
 */
var asciiToArray = function (str) {
  var arr = Base64.newBinary(str.length);
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c > 0xFF) {
      throw new Error('Not ascii');
    }
    arr[i] = c;
  }
  return arr;
};

var arrayToAscii = function (arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    res.push(String.fromCharCode(arr[i]));
  }
  return res.join('');
};

// No WebWorkers
Tinytest.add('MDG - No WebWorkers - testing the test', function (test) {
  test.equal(arrayToAscii(asciiToArray('The quick brown fox jumps over the lazy dog')), 'The quick brown fox jumps over the lazy dog');
});

Tinytest.add('MDG - No WebWorkers - empty', function (test) {
  test.equal(meteorA2B.encode(EJSON.newBinary(0)), '');
  test.equal(meteorA2B.decode(''), EJSON.newBinary(0));
});


Tinytest.add('MDG - No WebWorkers - wikipedia examples', function (test) {
  var tests = [
    {txt: 'pleasure.', res: 'cGxlYXN1cmUu'},
    {txt: 'leasure.', res: 'bGVhc3VyZS4='},
    {txt: 'easure.', res: 'ZWFzdXJlLg=='},
    {txt: 'asure.', res: 'YXN1cmUu'},
    {txt: 'sure.', res: 'c3VyZS4='}
  ];
  _.each(tests, function(t) {
    test.equal(meteorA2B.encode(asciiToArray(t.txt)), t.res);
    test.equal(arrayToAscii(meteorA2B.decode(t.res)), t.txt);
  });
});

Tinytest.add('MDG - No WebWorkers - non-text examples', function (test) {
  var tests = [
    {array: [0, 0, 0], b64: 'AAAA'},
    {array: [0, 0, 1], b64: 'AAAB'}
  ];
  _.each(tests, function(t) {
    test.equal(meteorA2B.encode(t.array), t.b64);
    var expectedAsBinary = EJSON.newBinary(t.array.length);
    _.each(t.array, function (val, i) {
      expectedAsBinary[i] = val;
    });
    test.equal(meteorA2B.decode(t.b64), expectedAsBinary);
  });
});

// With WebWorkers
Tinytest.add('MDG - With WebWorkers - testing the test', function (test) {
  test.equal(arrayToAscii(asciiToArray('The quick brown fox jumps over the lazy dog')), 'The quick brown fox jumps over the lazy dog');
});

Tinytest.add('MDG - With WebWorkers - empty', function (test) {
  test.equal(meteorA2BWW.encode(EJSON.newBinary(0)), '');
  test.equal(meteorA2BWW.decode(''), EJSON.newBinary(0));
});


Tinytest.add('MDG - With WebWorkers - wikipedia examples', function (test) {
  var tests = [
    {txt: 'pleasure.', res: 'cGxlYXN1cmUu'},
    {txt: 'leasure.', res: 'bGVhc3VyZS4='},
    {txt: 'easure.', res: 'ZWFzdXJlLg=='},
    {txt: 'asure.', res: 'YXN1cmUu'},
    {txt: 'sure.', res: 'c3VyZS4='}
  ];
  _.each(tests, function(t) {
    test.equal(meteorA2BWW.encode(asciiToArray(t.txt)), t.res);
    test.equal(arrayToAscii(meteorA2BWW.decode(t.res)), t.txt);
  });
});

Tinytest.add('MDG - With WebWorkers - non-text examples', function (test) {
  var tests = [
    {array: [0, 0, 0], b64: 'AAAA'},
    {array: [0, 0, 1], b64: 'AAAB'}
  ];
  _.each(tests, function(t) {
    test.equal(meteorA2BWW.encode(t.array), t.b64);
    var expectedAsBinary = EJSON.newBinary(t.array.length);
    _.each(t.array, function (val, i) {
      expectedAsBinary[i] = val;
    });
    test.equal(meteorA2BWW.decode(t.b64), expectedAsBinary);
  });
});

Meteor.setTimeout(() => {
  const mTimings = {};
  const method = [];
  Object.keys(timings).forEach((k) => {
    method.push(timings[k]);
    mTimings[timings[k]] = k;
  });
  console.log(mTimings);

  const fmethod = Math.min(...method);
  console.warn('Fastest method: ', fmethod, mTimings[fmethod]);

  const smethod = Math.max(...method);
  console.warn('Slowest method: ', smethod, mTimings[smethod]);
}, 30000);
