import Transaction from './models/transaction.js';
import { sequelize } from './connection/index.js';
import Account from './models/account.js';
import { generateAccount, generateReserveAccount, verifytransaction } from './helpers/payment.js';
import { getUser } from './helpers/auth.js';
import axios from 'axios';
import Bills from './helpers/bills.js';
import { Op } from 'sequelize';

const controller = {
  
  async transactions(req, res, next) {
    try {
      const user = res.locals.user;
      const result = await Transaction.findAll({
        where: {
          [Op.or]: [{ sender: user.id }, { receiver: user.id }],
        },
      });

      res.status(200).json({
        status: true,
        message: 'success',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: 'error',
      });
    }
  },

  async createTrtansaction(req, res) {
    const user = res.locals.user;
    const transaction = await controller.createTrtansactionRecord(
      user,
      req.body
    );
    res.status(200).json({
      status: true,
      message: 'success',
      data: transaction,
    });
  },

  async createTrtansactionRecord(user, body) {
    return await sequelize.transaction(async (t) => {
      await Transaction.create(
        {
          ...body,
          sender: user.id,
          is_transfer: false,
        },
        { transaction: t }
      );
    });
  },

  async userBalance(req, res) {
    const user = res.locals.user;
    let balance = await controller.walletBalance(user);
    if (balance.pendingBalance >= 50000) {
      await controller.CreditGift(user)
      balance = await controller.walletBalance(user);
    }
    res.status(200).json({
      status: true,
      message: 'success',
      data: balance,
    });
  },

  async walletBalance(user) {
    const userBalance = await Transaction.sum('amount', {
      where: {
        receiver: user.id,
        status: true,
      },
    });
    const bal = await Transaction.findAll({where:{status:false, receiver:user.id}})
    const pendinguserBalance = await Transaction.sum('amount', {
      where: {
        receiver: user.id,
        status: false,
        is_transfer: false,
      },
    });
    
    return {
      availableBalance: userBalance || 0,
      pendingBalance: pendinguserBalance || 0,
    };
  },

  async CreditGift(user) {
    const userBalance = await Transaction.update(
      {
        status: true,
      },
      {
        where: {
          receiver: user.id,
          status: false,
          is_transfer: false,
        },
      }
    );
    return userBalance || 0;
  },

  // ACCOUNTS

  async generateReserveAccount(req, res) {
    try {
      const { user } = await getUser(req.headers);
      const result = await generateReserveAccount({
        account_name: `${user.first_name} ${user.last_name}`,
        bvn: user.bvn,
      });
      res.status(200).json({ status: true, message: 'success', data: data });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: 'error',
      });
    }
  },
  async getAccount(req, res, next) {
    try {
      const user = res.locals.user;
      const result = await Account.findOne({ where: { user_id: user.id } });
      res.status(200).json({
        status: true,
        message: 'success',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: 'error',
      });
    }
  },
  async generateVirtualAccount(req, res, next) {
    try {
      const user = res.locals.user;
      const { amount, account_name } = req.body;
      const result = await generateAccount({
        account_name: account_name,
        amount: amount,
      });
      await sequelize.transaction(async (t) => {
        Transaction.create(
          {
            ...req.body,
            sender: user.id,
            ref: result.initiationTranRef,
          },
          { transaction: t }
        );
      });
      res.status(200).json({
        status: true,
        message: 'success',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: 'error',
      });
    }
  },
  async verifyTransaction(req, res) {
    try {
      const {transaction_ref} = req.params
      let  data  = await verifytransaction(transaction_ref);
      res.status(200).send({status:true, data, message:"Fetched"});
    } catch (error) {
      res
        .status(400)
        .send({
          data: null,
          message: error?.response?.data?.message,
          status: salse,
        });
    }
  },

  // BILLS
  async checkMeter(req, res) {
    try {
      let  data  = await Bills.checkMeter(req.body);
      res.status(200).send({status:true, data, message:"Fetched"});
    } catch (error) {
      res
        .status(400)
        .send({
          data: null,
          message: error?.response.data?.message,
          status: salse,
        });
    }
  },

  async checkDisco(req, res) {
    try {
      let data = await Bills.checkDisco();
      return res.status(200).send(data);
    } catch (error) {
      // Handle errors by sending an error response
      return res
        .status(400)
        .send(error.message ?? { error: 'something went wrong' });
    }
  },
  async priceList(req, res) {
    try {
      let data = await Bills.priceList(req.body);
      return res.status(200).send(data);
    } catch (error) {
      res.status(400).send(error.message ?? { error: 'something went wrong' });
    }
  },
  async purchaseBill(req, res, next) {
    try {
      const user = res.locals.user;
      const { amount, vertical, meter, disco } = req.body;
      let balance = await controller.walletBalance(user);

      if (amount > balance.availableBalance) {
        return res
          .status(400)
          .send({ status: false, message: 'Insufficient balance' });
      }
      const data = await Bills.purchaseBill(req.body);

      if (data.status && data.responseCode == 200) {
        const payload = {
          amount: -Number(amount),
          receiver: user.id,
          description: `Purchase for ${vertical},  ${disco}(${meter})`,
          status: true,
        };
        await controller.createTrtansactionRecord(user, payload);
        balance = 0;
      }
      return res.status(200).send(data);
    } catch (error) {
      res
        .status(200)
        .send({ status: false, message: 'error occured, please try again' });
    }
  },
};
export default controller;
