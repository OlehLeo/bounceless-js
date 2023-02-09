import axios from 'axios';
import fs from 'fs';

import config from './config';

export const verifyBulkEmails = async (emails, secret) => {
  if (!emails || !Array.isArray(emails)) throw new Error('First argument must be an array');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  const endpoint = '/verifyApiFile';
  const url = config.bouncelessAPIURL + endpoint;

  //generate random name for temp file
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

  //create temp csv file, api accepts file only for multiple emails check
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
  try {
    const { data } = await axios.post(
      url,
      { file_contents: fileStream },
      {
        headers,
        params
      }
    );

    return { fileId: data };
  } catch (e) {
    throw new Error(`API returns an error with message: ${e.message}`);
  } finally {
    fs.unlink(fileLocation, (e) => {
      if (e) throw new Error(`Can not remove temp file, reason: ${e.message}`);
    });
  }
};
