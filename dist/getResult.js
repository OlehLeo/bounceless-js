'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResult = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getResult = exports.getResult = async function getResult(options, secret) {
  if (!options || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') throw new Error('First argument must be an options object');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  var _options$fileId = options.fileId,
      fileId = _options$fileId === undefined ? null : _options$fileId,
      _options$parse = options.parse,
      parse = _options$parse === undefined ? false : _options$parse,
      _options$okOnly = options.okOnly,
      okOnly = _options$okOnly === undefined ? false : _options$okOnly;

  if (!fileId) throw new Error('File id is required');

  var endpoint = '/getApiFileInfo';
  var url = _config2.default.bouncelessAPIURL + endpoint;

  var params = {
    id: fileId,
    secret: secret
  };

  try {
    var _ref = await _axios2.default.get(url, {
      params: params
    }),
        data = _ref.data;

    if (!data) return null;

    var linkToResultFile = function () {
      var splittedResult = data.split('|');
      var lastElementIndex = splittedResult.length - 1;
      return okOnly ? splittedResult[lastElementIndex - 1] : splittedResult[lastElementIndex];
    }();
    if (!parse) return linkToResultFile;

    //data parsing from an api csv file to an array of objects

    var _ref2 = await _axios2.default.get(linkToResultFile),
        resultString = _ref2.data;

    var splittedResult = resultString.split('\r\n');
    splittedResult.pop();
    var keys = function () {
      var string = splittedResult.shift();
      var splitted = string.split(';');
      var formatted = splitted.map(function (element) {
        return element ? element.replaceAll('"', '') : null;
      });
      return formatted;
    }();
    var formattedResult = splittedResult.map(function (element) {
      var splitted = element.split(';');
      var result = {};
      keys.forEach(function (key, i) {
        var value = splitted[i] ? splitted[i].replaceAll('"', '') : null;
        var object = _defineProperty({}, key, value);
        Object.assign(result, object);
      });
      return result;
    });

    return formattedResult;
  } catch (e) {
    throw new Error('API returns an error with message: ' + e.message);
  }
};