import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection/index.js';


export default class Transaction extends Model {}
Transaction.init(
  {
    unique_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:"payment"
    },
    receiver: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sender: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ref: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_transfer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // available: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue:false,
    // },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
    },
  },

  {
    sequelize,
  }
);