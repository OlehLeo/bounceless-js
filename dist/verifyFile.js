'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyFile = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var verifyFile = exports.verifyFile = async function verifyFile(fileStream, secret) {
  if (!fileStream) throw new Error('No file stream provided');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  var endpoint = '/verifyApiFile';
  var url = _config2.default.bouncelessAPIURL + endpoint;

  var headers = { 'Content-Type': 'multipart/form-data' };
  var params = {
    secret: secret
  };

  try {
    var _ref = await _axios2.default.post(url, { file_contents: fileStream }, {
      headers: headers,
      params: params
    }),
        data = _ref.data;

    return { fileId: data };
  } catch (e) {
    throw new Error('API returns an error with message: ' + e.message);
  }
};