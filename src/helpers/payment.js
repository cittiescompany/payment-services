import axios from 'axios';

export const generateReserveAccount = async (data) => {
  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.PAYMENT_BASE_URL}/PiPCreateReservedAccountNumber`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Signature': process.env.X_AUTH_SIGNATURE,
      'Client-Id': process.env.PAYMENT_CLIENT_ID,
    },
    data: data,
  };

  try {
    const { data } = await axios(config);
    return data;
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw error;
  }
};

export const generateAccount = async (data) => {

  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.PAYMENT_BASE_URL}/PiPCreateDynamicAccountNumber`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Signature': process.env.X_AUTH_SIGNATURE,
      'Client-Id': process.env.PAYMENT_CLIENT_ID,
    },
    data: data,
  };
  try {
    const data  = await axios(config);
    return data;
  } catch (error) {
    console.error(error);
    return error?.response?.data;
  }
};

export const updateAccountName = async (data) => {
  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.PAYMENT_BASE_URL}/PiPUpdateAccountName`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Signature': process.env.X_AUTH_SIGNATURE,
      'Client-Id': process.env.PAYMENT_CLIENT_ID,
    },
    data: data,
  };

  try {
    const { data } = await axios(config);
    return data;
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw error;
  }
};
export const verifytransaction = async (transaction_ref) => {
  var config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${process.env.PAYMENT_BASE_URL}/PiPverifyTransaction?session_id=${transaction_ref}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Signature': process.env.X_AUTH_SIGNATURE,
      'Client-Id': process.env.PAYMENT_CLIENT_ID,
    },
  };

  try {
    const { data } = await axios(config);
    return data;
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw error;
  }
};
export const verifytransactionBySession = async (session_id) => {
  var config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${process.env.PAYMENT_BASE_URL}/PiPverifyTransaction_sessionid?session_id=${session_id}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Signature': process.env.X_AUTH_SIGNATURE,
      'Client-Id': process.env.PAYMENT_CLIENT_ID,
    },
  };

  try {
    const { data } = await axios(config);
    return data;
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw error;
  }
};
export const verifytransactionBySettlement = async (settlement_id) => {
  var config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${process.env.PAYMENT_BASE_URL}/PiPverifyTransaction_settlementid?settlement_id=${settlement_id}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Signature': process.env.X_AUTH_SIGNATURE,
      'Client-Id': process.env.PAYMENT_CLIENT_ID,
    },
  };

  try {
    const { data } = await axios(config);
    return data;
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw error;
  }
};
