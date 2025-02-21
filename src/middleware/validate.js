import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  var errorValidation = validationResult(req);
  if (errorValidation.errors.length !== 0) {
    return res
      .status(200)
      .send({ status: false, message: errorValidation.errors[0].msg });
  }
  next();
};

export function requestFromAnotherServer(req, res, next) {
  res.locals.isRequest = true;
  next();
}
