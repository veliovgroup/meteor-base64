Tinytest.add('Base64.encode()', function (test) {
  test.equal(Base64.encode('My Plain String'), 'TXkgUGxhaW4gU3RyaW5n');
});

Tinytest.add('Base64.decode()', function (test) {
  test.equal(Base64.decode('TXkgUGxhaW4gU3RyaW5n'), 'My Plain String');
});