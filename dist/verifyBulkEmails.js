'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyBulkEmails = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var verifyBulkEmails = exports.verifyBulkEmails = async function verifyBulkEmails(emails, secret) {
  if (!emails || !Array.isArray(emails)) throw new Error('First argument must be an array');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  var endpoint = '/verifyApiFile';
  var url = _config2.default.bouncelessAPIURL + endpoint;

  //generate random name for temp file
  var randomName = function () {
    var charsNumber = 12;
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    for (var i = 0; i < charsNumber; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }();
  var fileName = randomName + '.csv';

  //create temp csv file, api accepts file only for multiple emails check
  var emailsString = 'Email';
  emails.forEach(function (email) {
    emailsString += '\r\n' + email;
  });

  _fs2.default.writeFileSync(fileName, emailsString);
  var fileLocation = './' + fileName;
  var fileStream = _fs2.default.createReadStream(fileLocation);

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
  } finally {
    _fs2.default.unlink(fileLocation, function (e) {
      if (e) throw new Error('Can not remove temp file, reason: ' + e.message);
    });
  }
};