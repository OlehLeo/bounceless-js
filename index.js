import axios from 'axios';
import fs from 'fs';

const bouncelessAPIURL = 'https://apps.bounceless.io/api';

const verifySingleEmail = async (email, secret) => {
  const endpoint = '/verifyEmail';
  const url = bouncelessAPIURL + endpoint;
  const params = {
    email,
    secret
  };
  const { data } = await axios.post(url, null, {
    params
  });
  return data;
};

const verifyFile = async (fileLocation, secret) => {
  const endpoint = '/verifyApiFile';
  const url = bouncelessAPIURL + endpoint;
  const fileStream = fs.createReadStream(fileLocation);
  const fileContents = { file_contents: fileStream };
  const headers = { 'Content-Type': 'multipart/form-data' };
  const params = {
    secret
  };
  const { data } = await axios.post(url, fileContents, {
    headers,
    params
  });
  return { fileId: data };
};

const verifyBulkEmails = async (emails, secret) => {
  if (!Array.isArray(emails)) throw new Error('First argument must be an array');

  const endpoint = '/verifyApiFile';
  const url = bouncelessAPIURL + endpoint;
  const randomName = (() => {
    const charsNumber = 12;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < charsNumber; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  })();
  const fileName = `${randomName}.csv`;

  let emailsString = 'Email';
  emails.forEach((email) => {
    emailsString += `\r\n${email}`;
  });

  fs.writeFileSync(fileName, emailsString);
  const fileLocation = `./${fileName}`;
  const fileStream = fs.createReadStream(fileLocation);

  const headers = { 'Content-Type': 'multipart/form-data' };
  const params = {
    secret
  };

  const { data } = await axios.post(
    url,
    { file_contents: fileStream },
    {
      headers,
      params
    }
  );
  fs.unlink(fileLocation, (err) => {
    if (err) console.log(err.message);
  });
  return { fileId: data };
};

const getResult = async (options, secret) => {
  const { fileId = null, parse = null, okOnly = null, timeout = null } = options;
  const endpoint = '/getApiFileInfo';
  const url = bouncelessAPIURL + endpoint;

  const params = {
    id: fileId,
    secret
  };
  const { data } = await axios.get(url, {
    params
  });
  if (!data) {
    if (!timeout) return null;

    const emailBasicResults = await (() => {
      return new Promise((resolve) => {
        const interval = setInterval(async () => {
          const { data } = await axiosInstance.get(`/api/prospect-lists/${listId}/prospects/email/find/bulk/result`, {
            params: { fileId: createdBasicResult.data.fileId, checkType: 'basic' }
          });
          if (data) {
            clearInterval(interval);
            resolve(data);
          }
        }, basicIntervalInMs);
      });
    })();
  }

  const linkToResultFile = (() => {
    const splittedResult = data.split('|');
    const lastElementIndex = splittedResult.length - 1;
    return okOnly ? splittedResult[lastElementIndex - 1] : splittedResult[lastElementIndex];
  })();
  if (!parse) return linkToResultFile;

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
};

export { verifySingleEmail, verifyFile, verifyBulkEmails, getResult };
