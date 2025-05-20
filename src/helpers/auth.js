import axios from 'axios';
import jwt from 'jsonwebtoken';

export const verify_jwt = (encoded, word) => {
  return jwt.verify(encoded, word);
};

export const getUser =  async(body) => {

     const {authorization} = body
  var config = {
      method: 'get',
    maxBodyLength: Infinity,
      url: `${process.env.USER_BASE_URL}/user`,
      headers: { 
        'Content-Type': 'application/json', 
        'authorization': `${authorization}`
      }
    };

    try {
      const {data} = await axios(config);
      return data;
    } catch (error) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
}