'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifySingleEmail = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var verifySingleEmail = exports.verifySingleEmail = async function verifySingleEmail(email, secret) {
  if (!email) throw new Error('No email provided');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  var endpoint = '/verifyEmail';
  var url = _config2.default.bouncelessAPIURL + endpoint;
  var params = {
    email: email,
    secret: secret
  };

  try {
    var _ref = await _axios2.default.post(url, null, {
      params: params
    }),
        data = _ref.data;

    return data;
  } catch (e) {
    throw new Error('API returns an error with message: ' + e.message);
  }
};