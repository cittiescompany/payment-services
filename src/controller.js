import Transaction from './models/transaction.js';

const controller = {
  async create(req, res, next) {
    try {
      const result = await Transaction.findAll({});

      res.status(200).json({
        message: 'success',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: 'error',
      });
    }
  },
};
export default controller;
