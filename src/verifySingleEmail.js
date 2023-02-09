import axios from 'axios';

import config from './config';

export const verifySingleEmail = async (email, secret) => {
  if (!email) throw new Error('No email provided');
  if (!secret || typeof secret !== 'string') throw new Error('No or incorrect secret');

  const endpoint = '/verifyEmail';
  const url = config.bouncelessAPIURL + endpoint;
  const params = {
    email,
    secret
  };

  try {
    const { data } = await axios.post(url, null, {
      params
    });
    return data;
  } catch (e) {
    throw new Error(`API returns an error with message: ${e.message}`);
  }
};
