Package.describe({
  name: 'ostrio:base64',
  version: '1.0.0',
  summary: 'Isomorphic string encoding and decoding Base64 implementation',
  git: 'https://github.com/VeliovGroup/meteor-base64',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('base64.js');
  api.export('Base64');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('ostrio:base64');
  api.addFiles('base64-tests.js');
});
