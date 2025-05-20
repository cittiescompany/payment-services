import 'dotenv/config';
import { verify_jwt } from '../helpers/auth.js';


export const authenticate = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized' });
    }
    const token = req?.headers?.authorization?.split(' ');
    if (token[0] != 'Bearer')
      return res
        .status(401)
        .json({ message: 'unauthorized!!!', status: false });

    const data = await verify_jwt(token[1], process.env.USERJWTLOGIN);
    if (!data)
      return res.status(401).json({ message: 'Token expired', status: false });
    res.locals.user=data
    next();
  } catch (error) {
    console.log(error.message);
    return res
      .status(401)
      .json({ message: 'unauthorize access', status: false });
  }
};