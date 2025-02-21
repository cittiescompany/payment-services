import 'dotenv/config';
import User from '../models/user.js';
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
        .status(200)
        .json({ message: 'unauthorized!!!', status: false });

    const data = await verify_jwt(token[1], process.env.USERJWTLOGIN);
    if (!data.status)
      return res.status(200).json({ message: 'Token expired', status: false });

    let user = await User.findByPk(data.data.id, {
      attributes: [
        ['unique_id', 'id'],
        'email',
        'last_name',
        'business_name',
        'state',
      ],
      include: [
        { model: User, as: 'following' },
        { model: User, as: 'BlockedByUsers', attributes: ['unique_id'] },
        { model: User, as: 'BlockedUsers', attributes: ['unique_id'] },
      ],
    });
    if (!user) return new Error('unauthorize access');
    user = user.toJSON();
    req.body = { ...req.body, auth_data: { ...user } };
    if (res.locals.isRequest) {
      return res
        .status(200)
        .json({ message: 'success', status: true, data: user });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res
      .status(200)
      .json({ message: 'unauthorize access', status: false });
  }
};
