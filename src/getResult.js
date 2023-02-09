import axios from 'axios';

import config from './config';

export const getResult = async (options, secret) => {
  if (!options || typeof options !== 'object') throw new Error('First argument must be an options object');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  const { fileId = null, parse = false, okOnly = false } = options;
  if (!fileId) throw new Error('File id is required');

  const endpoint = '/getApiFileInfo';
  const url = config.bouncelessAPIURL + endpoint;

  const params = {
    id: fileId,
    secret
  };

  try {
    const { data } = await axios.get(url, {
      params
    });
    if (!data) return null;

    const linkToResultFile = (() => {
      const splittedResult = data.split('|');
      const lastElementIndex = splittedResult.length - 1;
      return okOnly ? splittedResult[lastElementIndex - 1] : splittedResult[lastElementIndex];
    })();
    if (!parse) return linkToResultFile;

    //data parsing from an api csv file to an array of objects
    const { data: resultString } = await axios.get(linkToResultFile);
    const splittedResult = resultString.split('\r\n');
    splittedResult.pop();
    const keys = (() => {
      const string = splittedResult.shift();
      const splitted = string.split(';');
      const formatted = splitted.map((element) => (element ? element.replaceAll('"', '') : null));
      return formatted;
    })();
    const formattedResult = splittedResult.map((element) => {
      const splitted = element.split(';');
      const result = {};
      keys.forEach((key, i) => {
        const value = splitted[i] ? splitted[i].replaceAll('"', '') : null;
        const object = { [key]: value };
        Object.assign(result, object);
      });
      return result;
    });

    return formattedResult;
  } catch (e) {
    throw new Error(`API returns an error with message: ${e.message}`);
  }
};
