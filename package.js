Package.describe({
  name: 'ostrio:base64',
  version: '2.0.0',
  summary: 'Efficient isomorphic Base64 implementation, with support of WebWorkers, Native code and Unicode',
  git: 'https://github.com/VeliovGroup/meteor-base64',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.6');
  api.use('ecmascript');
  api.addAssets('worker.min.js', 'client');
  api.mainModule('base64.js');
});

Package.onTest(function(api) {
  api.use(['tinytest', 'ecmascript', 'ejson', 'underscore']);
  api.use('ostrio:base64');
  api.addFiles('base64-tests.js');
});
