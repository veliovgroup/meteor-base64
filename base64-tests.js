import { Base64, base64 } from 'meteor/ostrio:base64';
const nativeA2B  = new base64(true, true);
const genStr     = (len) => {
  let result = '';
  const base = 'asdfghjk12345678asdfghjk12345678asdfghjk12345678';
  const iterations = Math.ceil(len / 48);
  for (let i = 0; i < iterations; i++) {
    result += base;
  }
  return result;
}

const strs = {
  str1024: genStr(1024),
  str5120: genStr(5120),
  str10240: genStr(10240),
  str4k: genStr(1024 * 48),
  str20k: genStr(5120 * 48),
  str45k: genStr(10240 * 48)
};

const getTime = function() {
  return (this.window && this.window.performance && this.window.performance.now) ? this.window.performance.now() : +(new Date());
};

Tinytest.add('Base64.encode() - essential', function (test) {
  test.equal(Base64.encode('My Plain String'), 'TXkgUGxhaW4gU3RyaW5n');
});

Tinytest.add('Base64.encode() - speed (see console) - default - short 10k times', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    Base64.encode('My Plain String');
    a++;
  }
  console.info(`Encode: ${getTime() - s}ms`);
});

for (let name in strs) {
  Tinytest.add(`Base64.encode() - speed (see console) - default - ${name}`, function () {
    const s = getTime();
    let a = 0;
    while (a < 100) {
      Base64.encode(strs[name]);
      a++;
    }
    console.info(`Encode (${name}): ${getTime() - s}ms`);
  });
}

Tinytest.add('Base64.encode() - speed (see console) - using Native Code - short 10k times', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    nativeA2B.encode('My Plain String');
    a++;
  }
  console.info(`Encode using Native Code: ${getTime() - s}ms`);
});

for (let name in strs) {
  Tinytest.add(`Base64.encode() - speed (see console) - using Native Code - ${name}`, function () {
    const s = getTime();
    let a = 0;
    nativeA2B.encode(strs[name]);
    console.info(`Encode using Native Code (${name}): ${getTime() - s}ms`);
  });
}

Tinytest.addAsync('Base64.encode() - speed (see console) - async (WebWorker) - default - short 10k times', function (test, next) {
  let a = 0;
  let f = 0;
  let s = 0;
  while (a < 10000) {
    Base64.encode('My Plain String', (error, str) => {
      f++;
      if (f === 1) {
        s = getTime();
      } else if (f >= 10000) {
        test.equal(str, 'TXkgUGxhaW4gU3RyaW5n');
        console.info(`Encode async: ${getTime() - s}ms`);
        next();
      }
    });
    a++;
  }
});

for (let name in strs) {
  Tinytest.addAsync(`Base64.encode() - speed (see console) - async (WebWorker) - default - ${name}`, function (test, next) {
    let s = getTime();
    Base64.encode(strs[name], (error, str) => {
      console.info(`Encode async (${name}): ${getTime() - s}ms`);
      next();
    });
  });
}

Tinytest.add('Base64.decode() - essential', function (test) {
  test.equal(Base64.decode('TXkgUGxhaW4gU3RyaW5n'), 'My Plain String');
});

Tinytest.add('Base64.decode() - speed (see console) - default', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    Base64.decode('TXkgUGxhaW4gU3RyaW5n');
    a++;
  }
  console.info(`Decode: ${getTime() - s}ms`);
});

Tinytest.addAsync('Base64.decode() - speed (see console) - async (WebWorker) - default', function (test, next) {
  let a = 0;
  let f = 0;
  let s = 0;
  while (a < 10000) {
    Base64.decode('TXkgUGxhaW4gU3RyaW5n', (error, str) => {
      f++;
      if (f === 1) {
        s = getTime();
      } else if (f >= 10000) {
        test.equal(str, 'My Plain String');
        console.info(`Decode async: ${getTime() - s}ms`);
        next();
      }
    });
    a++;
  }
});

Tinytest.add('Base64.decode() - speed (see console) - using Native Code', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    nativeA2B.decode('TXkgUGxhaW4gU3RyaW5n');
    a++;
  }
  console.info(`Decode using Native Code: ${getTime() - s}ms`);
});

Tinytest.add('Base64.encode() - multi-line', function (test) {
  test.equal(Base64.encode('My Plain String\nMy Plain String'), 'TXkgUGxhaW4gU3RyaW5nCk15IFBsYWluIFN0cmluZw==');
});

Tinytest.add('Base64.decode() - multi-line', function (test) {
  test.equal(Base64.decode('TXkgUGxhaW4gU3RyaW5nCk15IFBsYWluIFN0cmluZw=='), 'My Plain String\nMy Plain String');
});


Tinytest.add('Base64.encode() - unicode', function (test) {
  test.equal(Base64.encode('小飼弾'), '5bCP6aO85by+');
});

Tinytest.add('Base64.encode() - speed (see console) - unicode - default', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    Base64.encode('小飼弾');
    a++;
  }
  console.info(`Encode unicode: ${getTime() - s}ms`);
});

Tinytest.add('Base64.encode() - speed (see console) - unicode - using Native Code', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    nativeA2B.encode('小飼弾');
    a++;
  }
  console.info(`Encode unicode using Native Code: ${getTime() - s}ms`);
});

Tinytest.addAsync('Base64.encode() - speed (see console) - async (WebWorker) - unicode - default', function (test, next) {
  let a = 0;
  let f = 0;
  let s = 0;
  while (a < 10000) {
    Base64.encode('小飼弾', (error, str) => {
      f++;
      if (f === 1) {
        s = getTime();
      } else if (f >= 10000) {
        test.equal(str, '5bCP6aO85by+');
        console.info(`Encode async unicode: ${getTime() - s}ms`);
        next();
      }
    });
    a++;
  }
});

Tinytest.add('Base64.decode() - unicode', function (test) {
  test.equal(Base64.decode('5bCP6aO85by+'), '小飼弾');
});

Tinytest.add('Base64.decode() - speed (see console) - unicode - default', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    Base64.decode('5bCP6aO85by+');
    a++;
  }
  console.info(`Decode unicode: ${getTime() - s}ms`);
});

Tinytest.add('Base64.decode() - speed (see console) - unicode - using Native Code', function () {
  const s = getTime();
  let a = 0;
  while (a < 10000) {
    nativeA2B.decode('5bCP6aO85by+');
    a++;
  }
  console.info(`Decode unicode using Native Code: ${getTime() - s}ms`);
});

Tinytest.add('Base64.encode() - unicode - multi-line', function (test) {
  test.equal(Base64.encode('小飼弾\n小飼弾'), '5bCP6aO85by+CuWwj+mjvOW8vg==');
});

Tinytest.add('Base64.decode() - unicode - multi-line', function (test) {
  test.equal(Base64.decode('5bCP6aO85by+CuWwj+mjvOW8vg=='), '小飼弾\n小飼弾');
});


Tinytest.addAsync('Base64.encode() - async (WebWorker) - unicode - essential', function (test, next) {
  Base64.encode('小飼弾', (error, b64) => {
    test.equal(b64, '5bCP6aO85by+');
    next();
  });
});

Tinytest.addAsync('Base64.decode() - async (WebWorker) - unicode - essential', function (test, next) {
  Base64.decode('5bCP6aO85by+', (error, str) => {
    test.equal(str, '小飼弾');
    next();
  });
});

Tinytest.addAsync('Base64.decode() - speed (see console) - async (WebWorker) - unicode - default', function (test, next) {
  let a = 0;
  let f = 0;
  let s = 0;
  while (a < 10000) {
    Base64.decode('5bCP6aO85by+', (error, str) => {
      f++;
      if (f === 1) {
        s = getTime();
      } else if (f >= 10000) {
        test.equal(str, '小飼弾');
        console.info(`Decode async unicode: ${getTime() - s}ms`);
        next();
      }
    });
    a++;
  }
});
