Isomorphic Base64 implementation
=====
Isomorphic string encoding and decoding Base64 implementation

# API
##### `Base64.encode(plainString)`
```js
Base64.encode('My Plain String');
// Returns 'TXkgUGxhaW4gU3RyaW5n'
```

##### `Base64.decode(base64EncodedString)`
```js
Base64.decode('TXkgUGxhaW4gU3RyaW5n');
// Returns 'My Plain String'
```