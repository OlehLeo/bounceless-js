import axios from 'axios';

import config from './config';

export const verifyFile = async (fileStream, secret) => {
  if (!fileStream) throw new Error('No file stream provided');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  const endpoint = '/verifyApiFile';
  const url = config.bouncelessAPIURL + endpoint;

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
  }
};
