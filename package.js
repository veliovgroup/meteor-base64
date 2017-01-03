Package.describe({
  name: 'ostrio:base64',
  version: '1.1.0',
  summary: 'Efficient isomorphic Base64 implementation, with support of WebWorkers, Native code and Unicode',
  git: 'https://github.com/VeliovGroup/meteor-base64',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('ecmascript@0.1.5');
  api.addAssets('worker.min.js', 'client');
  api.mainModule('base64.js');
  api.export('Base64');
});

Package.onTest(function(api) {
  api.use(['tinytest', 'ecmascript']);
  api.use('ostrio:base64');
  api.addFiles('base64-tests.js');
});