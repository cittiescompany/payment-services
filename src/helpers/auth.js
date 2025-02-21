import jwt from 'jsonwebtoken';

export const verify_jwt = (encoded, word) => {
  return jwt.verify(encoded, word, (err, result) => {
    if (err) return { error: err, status: false };
    return { data: result, status: true };
  });
}